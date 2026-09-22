import {
  MessageSquare,
  Users,
  FileText,
  Phone,
  Radio,
  ShieldCheck,
  UserPlus,
  Image,
  Zap,
  Smartphone,
  Video,
  type LucideIcon,
} from "lucide-react";

export type Feature = {
  icon: LucideIcon;
  title: string;
  description: string;
};

export const features: Feature[] = [
  {
    icon: MessageSquare,
    title: "Real-Time Messaging",
    description:
      "Send and receive messages instantly with zero lag, powered by a live reactive backend.",
  },
  {
    icon: Users,
    title: "Group Conversations",
    description:
      "Create groups for teams, friends, or communities and keep every conversation organized.",
  },
  {
    icon: FileText,
    title: "File Sharing",
    description:
      "Share images, videos, and documents directly in a conversation with instant previews.",
  },
  {
    icon: Phone,
    title: "Audio & Video Calls",
    description:
      "Crystal-clear voice and face-to-face video calling built in, right from your chat.",
  },
  {
    icon: Radio,
    title: "Online Presence",
    description:
      "See who's available in real time so you know the best moment to connect.",
  },
  {
    icon: ShieldCheck,
    title: "Secure Authentication",
    description:
      "Enterprise-grade authentication keeps your account and conversations protected.",
  },
  {
    icon: UserPlus,
    title: "Friend Connections",
    description:
      "Build your network by adding friends and teammates with a simple, intuitive flow.",
  },
  {
    icon: Image,
    title: "Media Sharing",
    description:
      "Share photos, videos, and rich media seamlessly within any conversation.",
  },
];

export type Step = {
  title: string;
  description: string;
};

export const steps: Step[] = [
  {
    title: "Create your account",
    description: "Sign up in seconds with secure, hassle-free authentication.",
  },
  {
    title: "Find your people",
    description: "Add friends or teammates and build your own network.",
  },
  {
    title: "Start chatting",
    description: "Message, call, and share files the moment you connect.",
  },
];

export type Benefit = {
  icon: LucideIcon;
  title: string;
  description: string;
};

export const benefits: Benefit[] = [
  {
    icon: Zap,
    title: "Fast Communication",
    description: "Messages delivered in milliseconds, not minutes.",
  },
  {
    icon: Radio,
    title: "Real-Time Presence",
    description: "Always know who's online and ready to talk.",
  },
  {
    icon: FileText,
    title: "File Sharing",
    description: "Send documents and media without leaving the chat.",
  },
  {
    icon: Video,
    title: "Voice & Video",
    description: "High-quality calls integrated into every conversation.",
  },
  {
    icon: ShieldCheck,
    title: "Secure Authentication",
    description: "Protected accounts with industry-standard security.",
  },
  {
    icon: Smartphone,
    title: "Cross-Device Experience",
    description: "Stay connected seamlessly across all your devices.",
  },
];
