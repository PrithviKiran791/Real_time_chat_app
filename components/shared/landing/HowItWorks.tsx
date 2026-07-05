import { Fragment } from "react";
import { UserPlus, Users2, MessagesSquare, ArrowDown, ArrowRight } from "lucide-react";
import { steps } from "./data";

const icons = [UserPlus, Users2, MessagesSquare];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="bg-blue-950/[0.03] py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold uppercase tracking-wider text-[#1E3A8A]">
            How It Works
          </span>
          <h2 className="mt-3 font-heading text-3xl font-bold text-[#0F172A] sm:text-4xl">
            Up and running in three simple steps
          </h2>
        </div>

        <div className="mt-14 flex flex-col items-center gap-4 md:flex-row md:items-center md:justify-center md:gap-4">
          {steps.map((step, index) => {
            const Icon = icons[index];
            const isLast = index === steps.length - 1;
            return (
              <Fragment key={step.title}>
                <div className="flex w-64 flex-col items-center gap-4 rounded-2xl border border-[#0F172A]/10 bg-white p-6 text-center shadow-sm transition-shadow hover:shadow-md">
                  <span className="flex size-12 items-center justify-center rounded-full bg-blue-900/10 text-[#1E3A8A]">
                    <Icon className="size-6" />
                  </span>
                  <span className="text-xs font-semibold text-[#1E3A8A]">
                    Step {index + 1}
                  </span>
                  <h3 className="font-heading text-lg font-semibold text-[#0F172A]">
                    {step.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-gray-600">
                    {step.description}
                  </p>
                </div>

                {!isLast && (
                  <>
                    <ArrowDown className="size-6 shrink-0 text-[#1E3A8A] md:hidden" />
                    <ArrowRight className="hidden size-6 shrink-0 text-[#1E3A8A] md:block" />
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
