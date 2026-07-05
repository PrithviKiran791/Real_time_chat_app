import Link from "next/link";
import { MessageCircle } from "lucide-react";

const quickLinks = [
  { label: "Home", href: "#home" },
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "About", href: "#about" },
];

const legalLinks = [
  { label: "Privacy", href: "#privacy" },
  { label: "Terms", href: "#terms" },
  { label: "Contact", href: "#contact" },
];

const Footer = () => {
  return (
    <footer id="contact" className="bg-[#0F172A] text-white">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link href="#home" className="flex items-center gap-2">
              <span className="flex size-8 items-center justify-center rounded-xl bg-white/10">
                <MessageCircle className="size-[18px] text-[#38BDF8]" />
              </span>
              <span className="font-heading text-lg font-semibold">
                ChatSphere
              </span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-slate-300">
              Real-time communication, anywhere. Chat, call, and share
              instantly, from anywhere in the world.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white">Quick Links</h3>
            <ul className="mt-4 flex flex-col gap-2.5">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-sm text-[#7DD3FC] transition-colors hover:text-white"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white">Legal</h3>
            <ul className="mt-4 flex flex-col gap-2.5">
              {legalLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-sm text-[#7DD3FC] transition-colors hover:text-white"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white">Connect</h3>
            <div className="mt-4 flex items-center gap-3">
              <a
                href="https://github.com/PrithviKiran791/Real_time_chat_app"
                target="_blank"
                rel="noreferrer"
                aria-label="GitHub"
                className="flex size-9 items-center justify-center rounded-lg bg-white/10 text-[#7DD3FC] transition-colors hover:bg-[#38BDF8] hover:text-white"
              >
                <svg className="size-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" /><path d="M9 18c-4.51 2-5-2-7-2" /></svg>
              </a>
              <a
                href="#"
                aria-label="Twitter"
                className="flex size-9 items-center justify-center rounded-lg bg-white/10 text-[#7DD3FC] transition-colors hover:bg-[#38BDF8] hover:text-white"
              >
                <svg className="size-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" /></svg>
              </a>
              <a
                href="#"
                aria-label="LinkedIn"
                className="flex size-9 items-center justify-center rounded-lg bg-white/10 text-[#7DD3FC] transition-colors hover:bg-[#38BDF8] hover:text-white"
              >
                <svg className="size-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" /><rect width="4" height="12" x="2" y="9" /><circle cx="4" cy="4" r="2" /></svg>
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-white/10 pt-6 text-center text-xs text-slate-400">
          © {new Date().getFullYear()} ChatSphere. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
