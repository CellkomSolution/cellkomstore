"use client";

import { useState, useEffect } from "react";

interface CountdownTimerProps {
  targetDate: string | null;
}

export function CountdownTimer({ targetDate }: CountdownTimerProps) {
  const [isClient, setIsClient] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient || !targetDate) {
      return;
    }

    const calculateTimeLeft = () => {
      const difference = +new Date(targetDate) - +new Date();
      let newTimeLeft = { hours: 0, minutes: 0, seconds: 0 };

      if (difference > 0) {
        newTimeLeft = {
          hours: Math.floor(difference / (1000 * 60 * 60)),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        };
      }
      return newTimeLeft;
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate, isClient]);

  const formatTime = (time: number) => time.toString().padStart(2, "0");

  if (!isClient || !targetDate) {
    return (
      <div className="flex items-center gap-1 text-sm font-medium">
        <span className="bg-red-600 text-white px-2 py-1 rounded-md">--</span>
        <span className="text-red-600">:</span>
        <span className="bg-red-600 text-white px-2 py-1 rounded-md">--</span>
        <span className="text-red-600">:</span>
        <span className="bg-red-600 text-white px-2 py-1 rounded-md">--</span>
      </div>
    );
  }

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