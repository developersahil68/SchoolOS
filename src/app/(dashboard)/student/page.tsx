import Announcements from "@/components/Announcements";
import BigCalendar from "@/components/BigCalendar";
import BigCalendarContainer from "@/components/BigCalendarContainer";
import EventCalendar from "@/components/EventCalendar";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

const StudentPage = async () => {
  const { userId, sessionClaims } = await auth();

  const email = sessionClaims?.email || sessionClaims?.email_address;

  const classItem = await prisma.class.findMany({
    where: {
      students: { some: { email: email! } },
    },
    select: {
      id: true,
      name: true,
    },
  });
  // console.log(classItem[0]);

  const studentClass = classItem[0];
  return (
    <div className="p-4 flex gap-4 flex-col xl:flex-row">
      {/* Left */}

      <div className="w-full xl:w-2/3">
        <div className="h-full bg-white p-4 rounded-md">
          <h1 className="text-xl font-semibold">
            Schedule ({studentClass?.name})
          </h1>
          <BigCalendarContainer type="classId" id={classItem[0]?.id} />
        </div>
      </div>
      {/* RIght */}
      <div className="w-full xl:w-1/3 flex flex-col gap-8">
        <EventCalendar />
        <Announcements />
      </div>
    </div>
  );
};

export default StudentPage;
