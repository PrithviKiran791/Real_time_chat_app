import { Quote } from "lucide-react";
import { testimonials } from "./data";

const Testimonials = () => {
  return (
    <section className="bg-sky-50/40 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold uppercase tracking-wider text-[#38BDF8]">
            Testimonials
          </span>
          <h2 className="mt-3 font-heading text-3xl font-bold text-[#0F172A] sm:text-4xl">
            Loved by teams and communities
          </h2>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="flex flex-col gap-4 rounded-2xl border border-[#38BDF8]/40 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <Quote className="size-6 text-[#38BDF8]" />
              <p className="text-sm leading-relaxed text-gray-600">
                {t.quote}
              </p>
              <div className="mt-auto pt-2">
                <p className="text-sm font-semibold text-[#0F172A]">
                  {t.name}
                </p>
                <p className="text-xs text-gray-500">{t.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
