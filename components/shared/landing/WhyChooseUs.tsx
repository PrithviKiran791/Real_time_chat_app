import { benefits } from "./data";

const WhyChooseUs = () => {
  return (
    <section id="about" className="bg-white py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold uppercase tracking-wider text-[#1E3A8A]">
            Why Choose Us
          </span>
          <h2 className="mt-3 font-heading text-3xl font-bold text-[#0F172A] sm:text-4xl">
            Built for how you actually communicate
          </h2>
        </div>

        <div className="mt-14 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {benefits.map((benefit) => {
            const Icon = benefit.icon;
            return (
              <div
                key={benefit.title}
                className="group flex flex-col items-center gap-3 rounded-2xl border border-[#0F172A]/10 bg-white p-6 text-center transition-all duration-300 hover:-translate-y-1 hover:bg-[#0F172A] hover:shadow-lg"
              >
                <span className="flex size-11 items-center justify-center rounded-xl bg-blue-900/10 text-[#1E3A8A] transition-colors group-hover:bg-white/10 group-hover:text-[#60A5FA]">
                  <Icon className="size-[22px]" />
                </span>
                <span className="text-sm font-semibold text-[#0F172A] transition-colors group-hover:text-white">
                  {benefit.title}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
