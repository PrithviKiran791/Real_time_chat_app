"use client";

import { cn } from "@/lib/utils";
import { motion, stagger, useAnimate, useInView } from "motion/react";
import { useEffect } from "react";

export const TypewriterEffect = ({
  words,
  className,
  cursorClassName,
}: {
  words: {
    text: string;
    className?: string;
  }[];
  className?: string;
  cursorClassName?: string;
}) => {
  const wordsArray = words.map((word) => ({
    ...word,
    text: word.text.split(""),
  }));

  const [scope, animate] = useAnimate();
  const isInView = useInView(scope);

  useEffect(() => {
    if (isInView) {
      animate(
        "span.typewriter-char",
        {
          opacity: 1,
        },
        {
          duration: 0.05,
          delay: stagger(0.04),
          ease: "linear",
        }
      );
    }
  }, [isInView, animate]);

  return (
    <div
      ref={scope}
      className={cn(
        "text-base sm:text-xl md:text-2xl font-bold inline-flex items-center flex-wrap leading-normal",
        className
      )}
    >
      {wordsArray.map((word, idx) => (
        <span key={`word-${idx}`} className="inline-flex mr-1.5 whitespace-nowrap">
          {word.text.map((char, index) => (
            <motion.span
              initial={{ opacity: 0 }}
              key={`char-${index}`}
              className={cn("typewriter-char text-white", word.className)}
            >
              {char}
            </motion.span>
          ))}
        </span>
      ))}
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{
          duration: 0.8,
          repeat: Infinity,
          repeatType: "reverse",
        }}
        className={cn(
          "inline-block rounded-sm w-[3px] h-[1.2em] bg-[#60A5FA] shrink-0 align-middle ml-0.5",
          cursorClassName
        )}
      />
    </div>
  );
};

export const TypewriterEffectSmooth = ({
  words,
  className,
  cursorClassName,
  textClassName,
}: {
  words: {
    text: string;
    className?: string;
  }[];
  className?: string;
  cursorClassName?: string;
  textClassName?: string;
}) => {
  const wordsArray = words.map((word) => ({
    ...word,
    text: word.text.split(""),
  }));

  return (
    <div className={cn("inline-flex items-center space-x-1.5 py-1", className)}>
      <motion.div
        className="overflow-hidden"
        initial={{
          width: "0%",
        }}
        whileInView={{
          width: "fit-content",
        }}
        viewport={{ once: true }}
        transition={{
          duration: 1.8,
          ease: "easeInOut",
          delay: 0.2,
        }}
      >
        <div
          className={cn(
            "text-base sm:text-lg md:text-xl font-semibold whitespace-nowrap leading-normal py-0.5",
            textClassName
          )}
        >
          {wordsArray.map((word, idx) => (
            <span key={`word-${idx}`} className="inline-block mr-1.5">
              {word.text.map((char, index) => (
                <span
                  key={`char-${index}`}
                  className={cn("text-white", word.className)}
                >
                  {char}
                </span>
              ))}
            </span>
          ))}
        </div>
      </motion.div>
      <motion.span
        initial={{
          opacity: 0,
        }}
        animate={{
          opacity: 1,
        }}
        transition={{
          duration: 0.8,
          repeat: Infinity,
          repeatType: "reverse",
        }}
        className={cn(
          "inline-block rounded-sm w-[3px] h-[1.2em] bg-[#60A5FA] shrink-0 self-center",
          cursorClassName
        )}
      />
    </div>
  );
};

export function TypewriterEffectSmoothDemo() {
  const words = [
    { text: "Build" },
    { text: "awesome" },
    { text: "apps" },
    { text: "with" },
    { text: "Aceternity.", className: "text-blue-500 dark:text-blue-500" },
  ];
  return (
    <div className="flex flex-col items-center justify-center h-[40rem]">
      <p className="text-neutral-600 dark:text-neutral-200 text-xs sm:text-base">
        The road to freedom starts from here
      </p>
      <TypewriterEffectSmooth words={words} />
      <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 space-x-0 md:space-x-4">
        <button className="w-40 h-10 rounded-xl bg-black border dark:border-white border-transparent text-white text-sm">
          Join now
        </button>
        <button className="w-40 h-10 rounded-xl bg-white text-black border border-black text-sm">
          Signup
        </button>
      </div>
    </div>
  );
}
