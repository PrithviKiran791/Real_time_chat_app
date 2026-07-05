import { stats } from "./data";

const Stats = () => {
  return (
    <section className="bg-white py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="flex flex-col items-center gap-3 rounded-2xl bg-[#0F172A] px-4 py-8 text-center shadow-md transition-transform duration-300 hover:-translate-y-1"
              >
                <span className="flex size-10 items-center justify-center rounded-xl bg-white/10 text-[#38BDF8]">
                  <Icon className="size-5" />
                </span>
                <span className="font-heading text-2xl font-bold text-white sm:text-3xl">
                  {stat.value}
                </span>
                <span className="text-xs font-medium text-slate-300 sm:text-sm">
                  {stat.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Stats;
