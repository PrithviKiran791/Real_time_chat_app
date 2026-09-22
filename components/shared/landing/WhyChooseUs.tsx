import { benefits } from "./data";

const WhyChooseUs = () => {
  return (
    <section id="about" className="bg-[#020617] py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#60A5FA]">
            Made for momentum
          </span>
          <h2 className="mt-3 font-heading text-3xl font-bold text-white sm:text-4xl">
            Built for how you actually communicate
          </h2>
          <p className="mt-4 text-pretty text-base leading-relaxed text-[#94A3B8]">
            Every feature is designed around real conversations — fast,
            reliable, and secure across every device.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {benefits.map((benefit) => {
            const Icon = benefit.icon;
            return (
              <div
                key={benefit.title}
                className="group flex gap-4 rounded-xl border border-[#0B2A5B]/60 bg-[#061A3A]/35 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[#2563EB]/50 hover:bg-[#061A3A]/60 hover:shadow-lg hover:shadow-[#2563EB]/10"
              >
                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#2563EB]/15 text-[#60A5FA] transition-colors group-hover:bg-[#2563EB]/25">
                  <Icon className="size-5.5" />
                </span>
                <div>
                  <h3 className="font-heading text-base font-semibold text-white">
                    {benefit.title}
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-[#94A3B8]">
                    {benefit.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
