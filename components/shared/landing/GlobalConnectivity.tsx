import NetworkVisual from "./NetworkVisual";

const GlobalConnectivity = () => {
  return (
    <section className="relative overflow-hidden border-t border-[#0B2A5B]/40 bg-[#061A3A]/20 py-20 sm:py-28">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_#2563EB08_0%,_transparent_70%)]"
        aria-hidden="true"
      />

      <div className="relative mx-auto flex max-w-6xl flex-col items-center gap-10 px-4 sm:px-6 lg:flex-row lg:gap-16">
        <div className="flex-1 text-center lg:text-left">
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#60A5FA]">
            A network that feels close
          </span>
          <h2 className="mt-3 font-heading text-3xl font-bold text-white sm:text-4xl">
            One Network. Everyone Connected.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-pretty text-base leading-relaxed text-[#94A3B8] lg:mx-0">
            Our infrastructure keeps every message, call, and file moving
            seamlessly across borders — so distance never gets in the way of a
            real conversation.
          </p>
          <p className="mt-6 text-sm font-medium text-[#CBD5E1]">
            Real-time conversations without borders.
          </p>
        </div>

        <div className="flex shrink-0 items-center justify-center lg:w-[340px]">
          <NetworkVisual />
        </div>
      </div>
    </section>
  );
};

export default GlobalConnectivity;
