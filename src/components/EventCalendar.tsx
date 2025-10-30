"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

type ValuePiece = Date | null;

type Value = ValuePiece | [ValuePiece, ValuePiece];

const EventCalendar = () => {
  const [value, onChange] = useState<Value>(new Date());

  const router = useRouter();

  useEffect(() => {
    if (value instanceof Date) {
      const dateString = value.toISOString().split("T")[0];
      router.push(`?date=${dateString}`);
    }
  }, [value, router]);

  return <Calendar onChange={onChange} value={value} locale="en-US" />;
};

export default EventCalendar;
