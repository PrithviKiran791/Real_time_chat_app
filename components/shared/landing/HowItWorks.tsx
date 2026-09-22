import { Fragment } from "react";
import { ArrowDown, ArrowRight } from "lucide-react";
import { steps } from "./data";

const HowItWorks = () => {
  return (
    <section
      id="how-it-works"
      className="border-y border-[#0B2A5B]/50 bg-[#061A3A]/35 py-20 sm:py-28"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#60A5FA]">
            A simple start
          </span>
          <h2 className="mt-3 font-heading text-3xl font-bold text-white sm:text-4xl">
            Up and running in three simple steps
          </h2>
        </div>

        <div className="mt-14 flex flex-col items-center gap-4 md:flex-row md:items-stretch md:justify-center md:gap-6">
          {steps.map((step, index) => {
            const isLast = index === steps.length - 1;
            const stepNumber = String(index + 1).padStart(2, "0");

            return (
              <Fragment key={step.title}>
                <div className="group flex w-full max-w-xs flex-col gap-4 rounded-2xl border border-[#0B2A5B]/60 bg-[#020617]/60 p-6 text-center transition-all duration-300 hover:border-[#2563EB]/40 hover:shadow-lg hover:shadow-[#2563EB]/5 md:flex-1 md:max-w-none">
                  <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-[#2563EB]/15 font-heading text-lg font-bold text-[#60A5FA] transition-colors group-hover:bg-[#2563EB]/25">
                    {stepNumber}
                  </span>
                  <h3 className="font-heading text-lg font-semibold text-white">
                    {step.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-[#94A3B8]">
                    {step.description}
                  </p>
                </div>

                {!isLast && (
                  <>
                    <ArrowDown
                      className="size-5 shrink-0 text-[#2563EB]/60 md:hidden"
                      aria-hidden="true"
                    />
                    <ArrowRight
                      className="hidden size-5 shrink-0 self-center text-[#2563EB]/60 md:block"
                      aria-hidden="true"
                    />
                  </>
                )}
              </Fragment>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
