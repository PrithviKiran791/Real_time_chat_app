import { features } from "./data";

const Features = () => {
  return (
    <section id="features" className="border-t border-white/6 bg-[#020617] py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#60A5FA]">
            The essentials, connected
          </span>
          <h2 className="mt-3 font-heading text-3xl font-bold text-white sm:text-4xl">
            Everything you need to stay connected
          </h2>
          <p className="mt-4 text-pretty text-base leading-relaxed text-[#94A3B8]">
            A complete communication toolkit built for speed, reliability, and
            simplicity — wherever you are in the world.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="group flex flex-col gap-4 rounded-xl border border-[#0B2A5B]/70 bg-[#061A3A]/45 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[#60A5FA]/45 hover:bg-[#061A3A]/75 hover:shadow-xl hover:shadow-[#2563EB]/10"
              >
                <span className="flex size-11 items-center justify-center rounded-xl bg-[#2563EB]/15 text-[#60A5FA] transition-colors group-hover:bg-[#2563EB]/25">
                  <Icon className="size-5.5" />
                </span>
                <h3 className="font-heading text-lg font-semibold text-white">
                  {feature.title}
                </h3>
                <p className="text-sm leading-relaxed text-[#94A3B8]">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Features;
