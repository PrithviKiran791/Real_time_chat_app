import Globe from "./Globe";

const GlobalConnectivity = () => {
  return (
    <section className="relative overflow-hidden bg-sky-50 py-20 sm:py-28">
      <div className="mx-auto flex max-w-6xl flex-col items-center px-4 text-center sm:px-6">
        <div className="relative mb-4 h-[280px] w-[280px] sm:h-[360px] sm:w-[360px]">
          <Globe size={360} />
        </div>

        <span className="text-sm font-semibold uppercase tracking-wider text-[#38BDF8]">
          Global Connectivity
        </span>
        <h2 className="mt-3 font-heading text-3xl font-bold text-[#0F172A] sm:text-4xl">
          Powered by the cloud, connected worldwide
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-pretty text-base leading-relaxed text-gray-600">
          Our infrastructure keeps every message, call, and file moving
          seamlessly across borders, so distance never gets in the way of a
          real conversation.
        </p>
      </div>
    </section>
  );
};

export default GlobalConnectivity;
