"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, MessageCircle } from "lucide-react";
import {
  Show,
  SignInButton,
  UserButton,
} from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/ui/theme/theme-toggle";

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
    <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-6 sm:pt-4">
      <nav
        className="mx-auto flex max-w-6xl items-center justify-between rounded-2xl border border-white/20 bg-[#1E3A8A]/90 px-4 py-3 shadow-lg shadow-blue-900/15 backdrop-blur-md transition-all sm:px-6"
        aria-label="Primary"
      >
        <Link
          href="#home"
          className="flex items-center gap-2 text-white"
          aria-label="Go to home"
        >
          <span className="flex size-8 items-center justify-center rounded-xl bg-white/15">
            <MessageCircle className="size-[18px]" />
          </span>
          <span className="font-heading text-lg font-semibold tracking-tight">
            ChatSphere
          </span>
        </Link>

        <ul className="hidden items-center gap-1 lg:flex">
          {navItems.map((item) => (
            <li key={item.href}>
              <a
                href={item.href}
                className="group relative rounded-lg px-3 py-2 text-sm font-medium text-white/90 transition-colors hover:text-white"
              >
                {item.label}
                <span className="absolute inset-x-3 -bottom-0.5 h-px scale-x-0 bg-white transition-transform duration-300 group-hover:scale-x-100" />
              </a>
            </li>
          ))}
        </ul>

        <div className="hidden items-center gap-2 lg:flex">
          <Show when="signed-out">
            <SignInButton mode="modal">
              <Button className="bg-[#0F172A] text-white shadow-md transition-transform hover:-translate-y-0.5 hover:bg-[#1e2a4a]">
                Login
              </Button>
            </SignInButton>
          </Show>
          <Show when="signed-in">
            <Button
              asChild
              variant="ghost"
              className="text-white hover:bg-white/15 hover:text-white"
            >
              <Link href="/conversations">Dashboard</Link>
            </Button>
            <UserButton />
          </Show>
          <ModeToggle className="border-white/20 hover:bg-white/15 text-white hover:text-white bg-transparent" />
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="inline-flex size-9 items-center justify-center rounded-lg text-white transition-colors hover:bg-white/15 lg:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </nav>

      {open && (
        <div className="mx-auto mt-2 max-w-6xl rounded-2xl border border-white/20 bg-[#1E3A8A]/95 p-4 shadow-lg backdrop-blur-md lg:hidden">
          <ul className="flex flex-col gap-1">
            {navItems.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-lg px-3 py-2.5 text-sm font-medium text-white/90 transition-colors hover:bg-white/15 hover:text-white"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
          <div className="mt-3 flex flex-col gap-2 border-t border-white/20 pt-3">
            <Show when="signed-out">
              <SignInButton mode="modal">
                <Button className="w-full bg-[#0F172A] text-white hover:bg-[#1e2a4a]">
                  Login
                </Button>
              </SignInButton>
            </Show>
            <Show when="signed-in">
              <Button
                asChild
                className="w-full bg-[#0F172A] text-white hover:bg-[#1e2a4a]"
              >
                <Link href="/conversations">Dashboard</Link>
              </Button>
            </Show>
            <div className="flex items-center justify-between border-t border-white/10 pt-2 px-3">
              <span className="text-sm font-medium text-white/90">Theme</span>
              <ModeToggle className="border-white/20 hover:bg-white/15 text-white hover:text-white bg-transparent" />
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
