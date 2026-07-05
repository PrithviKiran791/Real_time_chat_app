import {
  MessageSquare,
  Users,
  FileText,
  CheckCheck,
  Phone,
  Video,
  ShieldCheck,
  CloudCog,
  Zap,
  Server,
  Layers,
  Smartphone,
  Radio,
  Sparkles,
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
      "Send and receive messages instantly with zero lag, powered by a live, reactive backend.",
  },
  {
    icon: Users,
    title: "Group Chats",
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
    icon: CheckCheck,
    title: "Read Receipts",
    description:
      "Know exactly when your messages have been delivered and read, in real time.",
  },
  {
    icon: Phone,
    title: "Audio Calls",
    description:
      "Jump on a crystal-clear voice call with a single tap, right from your conversation.",
  },
  {
    icon: Video,
    title: "Video Calls",
    description:
      "Face-to-face video calling built in, so you can stay close no matter the distance.",
  },
  {
    icon: ShieldCheck,
    title: "Secure Authentication",
    description:
      "Enterprise-grade authentication keeps your account and conversations protected.",
  },
  {
    icon: CloudCog,
    title: "Cloud Synchronization",
    description:
      "Your chats sync instantly across every device, always up to date, always available.",
  },
];

export type Step = {
  title: string;
  description: string;
};

export const steps: Step[] = [
  {
    title: "Create Account",
    description: "Sign up in seconds with secure, hassle-free authentication.",
  },
  {
    title: "Connect with Friends",
    description: "Add friends or teammates and build your own network.",
  },
  {
    title: "Start Chatting Instantly",
    description: "Message, call, and share files the moment you connect.",
  },
];

export type Benefit = {
  icon: LucideIcon;
  title: string;
};

export const benefits: Benefit[] = [
  { icon: ShieldCheck, title: "Secure" },
  { icon: Zap, title: "Fast" },
  { icon: Server, title: "Reliable" },
  { icon: CloudCog, title: "Cloud Powered" },
  { icon: Layers, title: "Scalable" },
  { icon: Smartphone, title: "Responsive" },
  { icon: Radio, title: "Real-Time" },
  { icon: Sparkles, title: "Modern UI" },
];

export type Stat = {
  icon: LucideIcon;
  value: string;
  label: string;
};

export const stats: Stat[] = [
  { icon: MessageSquare, value: "12M+", label: "Messages Sent" },
  { icon: Users, value: "250K+", label: "Active Users" },
  { icon: Layers, value: "40K+", label: "Groups Created" },
  { icon: FileText, value: "1.8M+", label: "Files Shared" },
  { icon: Video, value: "500K+", label: "Video Calls" },
];

export type Testimonial = {
  name: string;
  role: string;
  quote: string;
};

export const testimonials: Testimonial[] = [
  {
    name: "Ananya Rao",
    role: "Product Designer",
    quote:
      "Switching our team's chat here cut our response times in half. It feels instant, every single time.",
  },
  {
    name: "Marcus Lee",
    role: "Engineering Lead",
    quote:
      "The video calls and file sharing just work. No lag, no dropped connections, no complaints from the team.",
  },
  {
    name: "Priya Nair",
    role: "Community Manager",
    quote:
      "Managing group conversations for a global community used to be chaos. Now it's simple and reliable.",
  },
];
