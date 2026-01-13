"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import {
  resultSchema,
  ResultSchema,
} from "@/lib/formValidationSchemas";
import {
  createResult,
  updateResult,
} from "@/lib/actions";
import {
  Dispatch,
  SetStateAction,
  startTransition,
  useActionState,
  useEffect,
  useState,
} from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

const ResultForm = ({
  type,
  data,
  setOpen,
  relatedData,
}: {
  type: "create" | "update";
  data?: any;
  setOpen: Dispatch<SetStateAction<boolean>>;
  relatedData?: any;
}) => {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ResultSchema & { assessmentType?: string }>({
    resolver: zodResolver(resultSchema) as any,
  });

  const [state, formAction] = useActionState(
    type === "create" ? createResult : updateResult,
    {
      success: false,
      error: false,
    }
  );

  const onSubmit = handleSubmit((data) => {
    // Remove assessmentType before submitting
    const { assessmentType, ...submitData } = data;
    startTransition(() => {
      formAction(submitData as ResultSchema);
    });
  });

  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      toast(`Result has been ${type === "create" ? "created" : "updated"}!`);
      setOpen(false);
      router.refresh();
    }
  }, [state, router, type, setOpen]);

  const { exams = [], assignments = [], students = [], classes = [] } = relatedData || {};
  const [selectedClassId, setSelectedClassId] = useState<string | number | null>(
    null
  );
  const [initialAssessmentType, setInitialAssessmentType] = useState<string>(
    data?.examId ? "exam" : data?.assignmentId ? "assignment" : ""
  );
  const assessmentType = watch("assessmentType") || initialAssessmentType;

  // Get the classId from the exam/assignment if updating
  useEffect(() => {
    if (data) {
      if (data.examId) {
        const exam = exams.find(
          (exam: { id: number; classId: number }) => exam.id === data.examId
        );
        if (exam) {
          setSelectedClassId(exam.classId);
          setInitialAssessmentType("exam");
        }
      } else if (data.assignmentId) {
        const assignment = assignments.find(
          (assignment: { id: number; classId: number }) =>
            assignment.id === data.assignmentId
        );
        if (assignment) {
          setSelectedClassId(assignment.classId);
          setInitialAssessmentType("assignment");
        }
      }
    }
  }, [data, exams, assignments]);

  // Filter students by selected class
  const filteredStudents = selectedClassId
    ? students.filter(
        (student: { id: string; name: string; surname: string; classId: number }) =>
          student.classId === parseInt(selectedClassId as string)
      )
    : students;

  // Filter exams/assignments by selected class
  const filteredExams = selectedClassId
    ? exams.filter(
        (exam: { id: number; title: string; classId: number }) =>
          exam.classId === parseInt(selectedClassId as string)
      )
    : exams;

  const filteredAssignments = selectedClassId
    ? assignments.filter(
        (assignment: { id: number; title: string; classId: number }) =>
          assignment.classId === parseInt(selectedClassId as string)
      )
    : assignments;

  return (
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Create a new result" : "Update the result"}
      </h1>

      <div className="flex justify-between flex-wrap gap-4">
        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Class</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            value={selectedClassId ?? ""}
            onChange={(e) => {
              setSelectedClassId(e.target.value ? parseInt(e.target.value) : null);
            }}
          >
            <option value="" disabled>
              Select a class
            </option>
            {classes?.map((classItem: { id: number; name: string }) => (
              <option value={classItem.id} key={classItem.id}>
                {classItem.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Assessment Type</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("assessmentType")}
            defaultValue={initialAssessmentType}
            onChange={(e) => {
              // Clear the other field when switching types
              if (e.target.value === "exam") {
                setValue("assignmentId", null);
                setValue("examId", undefined);
              } else if (e.target.value === "assignment") {
                setValue("examId", null);
                setValue("assignmentId", undefined);
              }
            }}
          >
            <option value="" disabled>
              Select type
            </option>
            <option value="exam">Exam</option>
            <option value="assignment">Assignment</option>
          </select>
          {errors.examId?.message && (
            <p className="text-xs text-red-400">
              {errors.examId.message.toString()}
            </p>
          )}
        </div>
        {assessmentType === "exam" && (
          <div className="flex flex-col gap-2 w-full md:w-1/4">
            <label className="text-xs text-gray-500">Exam</label>
            <select
              className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
              {...register("examId", { valueAsNumber: true })}
              defaultValue={data?.examId ?? ""}
              disabled={!selectedClassId}
            >
              <option value="" disabled>
                {selectedClassId ? "Select an exam" : "Select a class first"}
              </option>
              {filteredExams?.map((exam: { id: number; title: string }) => (
                <option value={exam.id} key={exam.id}>
                  {exam.title}
                </option>
              ))}
            </select>
            {errors.examId?.message && (
              <p className="text-xs text-red-400">
                {errors.examId.message.toString()}
              </p>
            )}
          </div>
        )}
        {assessmentType === "assignment" && (
          <div className="flex flex-col gap-2 w-full md:w-1/4">
            <label className="text-xs text-gray-500">Assignment</label>
            <select
              className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
              {...register("assignmentId", { valueAsNumber: true })}
              defaultValue={data?.assignmentId ?? ""}
              disabled={!selectedClassId}
            >
              <option value="" disabled>
                {selectedClassId ? "Select an assignment" : "Select a class first"}
              </option>
              {filteredAssignments?.map((assignment: { id: number; title: string }) => (
                <option value={assignment.id} key={assignment.id}>
                  {assignment.title}
                </option>
              ))}
            </select>
            {errors.assignmentId?.message && (
              <p className="text-xs text-red-400">
                {errors.assignmentId.message.toString()}
              </p>
            )}
          </div>
        )}
        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Student</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("studentId")}
            defaultValue={data?.studentId ?? ""}
            disabled={!selectedClassId}
          >
            <option value="" disabled>
              {selectedClassId ? "Select a student" : "Select a class first"}
            </option>
            {filteredStudents?.map(
              (student: { id: string; name: string; surname: string }) => (
                <option value={student.id} key={student.id}>
                  {student.name} {student.surname}
                </option>
              )
            )}
          </select>
          {errors.studentId?.message && (
            <p className="text-xs text-red-400">
              {errors.studentId.message.toString()}
            </p>
          )}
        </div>
        <InputField
          label="Score"
          name="score"
          defaultValue={data?.score}
          register={register}
          error={errors?.score}
          type="number"
        />
        {data && (
          <InputField
            label="Id"
            name="id"
            defaultValue={data?.id}
            register={register}
            error={errors?.id}
            hidden
          />
        )}
      </div>
      {state.error && (
        <span className="text-red-500">Something went wrong!</span>
      )}
      <button className="bg-blue-400 text-white p-2 rounded-md">
        {type === "create" ? "Create" : "Update"}
      </button>
    </form>
  );
};

export default ResultForm;

