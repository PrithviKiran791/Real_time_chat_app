import Link from "next/link";
import { MessageCircle } from "lucide-react";

const productLinks = [
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "About", href: "#about" },
];

const Footer = () => {
  return (
    <footer id="contact" className="border-t border-[#0B2A5B]/60 bg-[#061A3A] text-white">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="#home" className="flex items-center gap-2.5">
              <span className="flex size-8 items-center justify-center rounded-lg bg-[#2563EB]/20">
                <MessageCircle className="size-4.5 text-[#60A5FA]" />
              </span>
              <span className="font-heading text-lg font-semibold">
                ChatSphere
              </span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-[#94A3B8]">
              A focused space to chat, call, and share with the people who matter.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white">Product</h3>
            <ul className="mt-4 flex flex-col gap-2.5">
              {productLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-sm text-[#94A3B8] transition-colors hover:text-[#60A5FA]"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white">Connect</h3>
            <div className="mt-4">
              <a
                href="https://github.com/PrithviKiran791/Real_time_chat_app"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-sm text-[#94A3B8] transition-colors hover:text-[#60A5FA]"
              >
                <svg
                  className="size-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                  <path d="M9 18c-4.51 2-5-2-7-2" />
                </svg>
                GitHub
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-[#0B2A5B]/60 pt-6 text-center text-xs text-[#64748B]">
          © {new Date().getFullYear()} ChatSphere. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
