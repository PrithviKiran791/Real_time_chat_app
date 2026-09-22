"use client";

import React, { useState } from "react";
import { motion, AnimatePresence, useMotionValue, type MotionValue } from "motion/react";
import { cn } from "@/lib/utils";

export const FollowerPointerCard = ({
  children,
  className,
  title,
  pointerColor,
}: {
  children: React.ReactNode;
  className?: string;
  title?: string | React.ReactNode;
  pointerColor?: string;
}) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const ref = React.useRef<HTMLDivElement>(null);
  const [isInside, setIsInside] = useState<boolean>(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      x.set(e.clientX - rect.left);
      y.set(e.clientY - rect.top);
    }
  };

  const handleMouseLeave = () => {
    setIsInside(false);
  };

  const handleMouseEnter = () => {
    setIsInside(true);
  };

  return (
    <div
      onMouseLeave={handleMouseLeave}
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      style={{
        cursor: "none",
      }}
      ref={ref}
      className={cn("relative", className)}
    >
      <AnimatePresence>
        {isInside && <FollowPointer x={x} y={y} title={title} color={pointerColor} />}
      </AnimatePresence>
      {children}
    </div>
  );
};

const DEFAULT_COLORS = [
  "#0ea5e9",
  "#10b981",
  "#6366f1",
  "#8b5cf6",
  "#3b82f6",
  "#ec4899",
  "#f59e0b",
];

export const FollowPointer = ({
  x,
  y,
  title,
  color,
}: {
  x: MotionValue<number>;
  y: MotionValue<number>;
  title?: string | React.ReactNode;
  color?: string;
}) => {
  const [randomColor] = useState<string>(
    () => DEFAULT_COLORS[Math.floor(Math.random() * DEFAULT_COLORS.length)]
  );

  const activeColor = color || randomColor;

  return (
    <motion.div
      className="pointer-events-none absolute z-50 h-4 w-4"
      style={{
        top: y,
        left: x,
      }}
      initial={{
        scale: 1,
        opacity: 1,
      }}
      animate={{
        scale: 1,
        opacity: 1,
      }}
      exit={{
        scale: 0,
        opacity: 0,
      }}
    >
      <svg
        stroke="currentColor"
        fill={activeColor}
        strokeWidth="1"
        viewBox="0 0 16 16"
        className="h-6 w-6 -translate-x-[12px] -translate-y-[10px] -rotate-[70deg] transform stroke-white/80 drop-shadow-md"
        height="1em"
        width="1em"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M14.082 2.182a.5.5 0 0 1 .103.557L8.528 15.467a.5.5 0 0 1-.917-.007L5.57 10.694.803 8.652a.5.5 0 0 1-.006-.916l12.728-5.657a.5.5 0 0 1 .556.103z"></path>
      </svg>
      <motion.div
        style={{
          backgroundColor: activeColor,
        }}
        initial={{
          scale: 0.5,
          opacity: 0,
        }}
        animate={{
          scale: 1,
          opacity: 1,
        }}
        exit={{
          scale: 0.5,
          opacity: 0,
        }}
        className="min-w-max rounded-full px-2.5 py-1 text-xs font-medium whitespace-nowrap text-white shadow-lg backdrop-blur-sm"
      >
        {title || `William Shakespeare`}
      </motion.div>
    </motion.div>
  );
};
