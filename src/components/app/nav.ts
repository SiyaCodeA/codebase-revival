import { LayoutDashboard, Mail, NotebookPen, ListChecks, Search, Settings } from "lucide-react";

export const featureNav = [
  { title: "Smart Email Generator", url: "/email", icon: Mail, description: "Draft clear, well-toned emails from a few notes." },
  { title: "Meeting Notes Summarizer", url: "/meetings", icon: NotebookPen, description: "Turn raw notes into decisions and action items." },
  { title: "AI Task Planner", url: "/tasks", icon: ListChecks, description: "Break a goal into a prioritised, scheduled plan." },
  { title: "AI Research Assistant", url: "/research", icon: Search, description: "Explore a question and get a structured overview." },
] as const;

export const mainNav = [{ title: "Dashboard", url: "/", icon: LayoutDashboard }] as const;
export const settingsNav = [{ title: "Settings", url: "/settings", icon: Settings }] as const;
