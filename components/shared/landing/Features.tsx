import { features } from "./data";

const Features = () => {
  return (
    <section id="features" className="bg-white py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold uppercase tracking-wider text-[#38BDF8]">
            Features
          </span>
          <h2 className="mt-3 font-heading text-3xl font-bold text-[#0F172A] sm:text-4xl">
            Everything you need to stay connected
          </h2>
          <p className="mt-4 text-pretty text-base leading-relaxed text-gray-600">
            A complete communication toolkit built for speed, reliability,
            and simplicity — wherever you are in the world.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="group flex flex-col gap-4 rounded-2xl bg-[#0F172A] p-6 shadow-lg shadow-slate-900/10 transition-all duration-300 hover:-translate-y-1.5 hover:scale-[1.02] hover:shadow-xl hover:shadow-sky-900/20"
              >
                <span className="flex size-11 items-center justify-center rounded-xl bg-white/10 text-[#38BDF8] transition-colors group-hover:bg-[#38BDF8]/20">
                  <Icon className="size-[22px]" />
                </span>
                <h3 className="font-heading text-lg font-semibold text-white">
                  {feature.title}
                </h3>
                <p className="text-sm leading-relaxed text-slate-300">
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
