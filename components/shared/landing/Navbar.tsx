"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, MessageCircle } from "lucide-react";
import {
  Show,
  UserButton,
} from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import styles from "./landing.module.css";

const navItems = [
  { label: "Home", href: "#home" },
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "About", href: "#about" },
  { label: "Contact", href: "#contact" },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-4 pt-4 sm:px-6">
      <nav
            className={`${styles.navbarEnter} mx-auto flex max-w-6xl items-center justify-between rounded-2xl border border-white/10 bg-[#061A3A]/85 px-4 py-2.5 shadow-2xl shadow-black/30 backdrop-blur-xl sm:px-5`}
        aria-label="Primary"
      >
        <Link
          href="#home"
          className="flex items-center gap-2.5 text-white"
          aria-label="ChatSphere home"
        >
          <span className="flex size-8 items-center justify-center rounded-lg bg-[#2563EB]/20">
            <MessageCircle className="size-4.5 text-[#60A5FA]" />
          </span>
          <span className="font-heading text-base font-semibold tracking-tight sm:text-lg">
            ChatSphere
          </span>
        </Link>

        <ul className="hidden items-center gap-0.5 lg:flex">
          {navItems.map((item) => (
            <li key={item.href}>
              <a
                href={item.href}
                className="group relative rounded-lg px-3 py-2 text-sm font-medium text-[#CBD5E1] transition-colors hover:text-white"
              >
                {item.label}
                <span className="absolute inset-x-3 -bottom-0.5 h-px scale-x-0 bg-[#60A5FA] transition-transform duration-300 group-hover:scale-x-100" />
              </a>
            </li>
          ))}
        </ul>

        <div className="hidden items-center gap-2 lg:flex">
          <Show when="signed-out">
            <Button
              asChild
              variant="ghost"
              className="text-[#CBD5E1] hover:bg-white/10 hover:text-white"
            >
              <Link href="/sign-in">Login</Link>
            </Button>
            <Button
              asChild
              className="bg-[#2563EB] text-white shadow-md shadow-[#2563EB]/20 transition-all hover:-translate-y-0.5 hover:bg-[#1d4ed8] hover:shadow-[#2563EB]/30"
            >
              <Link href="/sign-up">Get Started</Link>
            </Button>
          </Show>
          <Show when="signed-in">
            <Button
              asChild
              variant="ghost"
              className="text-[#CBD5E1] hover:bg-white/10 hover:text-white"
            >
              <Link href="/conversations">Dashboard</Link>
            </Button>
            <UserButton />
          </Show>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="inline-flex size-9 items-center justify-center rounded-lg text-white transition-colors hover:bg-white/10 lg:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </nav>

      {open && (
        <div className="mx-auto mt-2 max-w-5xl rounded-2xl border border-white/10 bg-[#061A3A]/95 p-4 shadow-xl backdrop-blur-md lg:hidden">
          <ul className="flex flex-col gap-0.5">
            {navItems.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-lg px-3 py-2.5 text-sm font-medium text-[#CBD5E1] transition-colors hover:bg-white/10 hover:text-white"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
          <div className="mt-3 flex flex-col gap-2 border-t border-white/10 pt-3">
            <Show when="signed-out">
              <Button
                asChild
                variant="outline"
                onClick={() => setOpen(false)}
                className="w-full border-white/15 bg-transparent text-white hover:bg-white/10"
              >
                <Link href="/sign-in">Login</Link>
              </Button>
              <Button
                asChild
                onClick={() => setOpen(false)}
                className="w-full bg-[#2563EB] text-white hover:bg-[#1d4ed8]"
              >
                <Link href="/sign-up">Get Started</Link>
              </Button>
            </Show>
            <Show when="signed-in">
              <Button
                asChild
                className="w-full bg-[#2563EB] text-white hover:bg-[#1d4ed8]"
              >
                <Link href="/conversations">Dashboard</Link>
              </Button>
            </Show>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
