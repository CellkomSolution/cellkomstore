"use client";

import { useState, useEffect } from "react";

interface CountdownTimerProps {
  targetDate: string;
}

export function CountdownTimer({ targetDate }: CountdownTimerProps) {
  const calculateTimeLeft = () => {
    const difference = +new Date(targetDate) - +new Date();
    let timeLeft = { hours: 0, minutes: 0, seconds: 0 };

    if (difference > 0) {
      timeLeft = {
        hours: Math.floor(difference / (1000 * 60 * 60)),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    }
    return timeLeft;
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setTimeout(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearTimeout(timer);
  });

  const formatTime = (time: number) => time.toString().padStart(2, "0");

  return (
    <div className="flex items-center gap-1 text-sm font-medium">
      <span className="bg-red-600 text-white px-2 py-1 rounded-md">
        {formatTime(timeLeft.hours)}
      </span>
      <span className="text-red-600">:</span>
      <span className="bg-red-600 text-white px-2 py-1 rounded-md">
        {formatTime(timeLeft.minutes)}
      </span>
      <span className="text-red-600">:</span>
      <span className="bg-red-600 text-white px-2 py-1 rounded-md">
        {formatTime(timeLeft.seconds)}
      </span>
    </div>
  );
}