"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { 
  MessageSquare, 
  BarChart3, 
  FileText, 
  Settings, 
  Users, 
  Shield,
  Home,
  PieChart
} from "lucide-react";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

interface SidebarProps {
  className?: string;
  isOpen?: boolean;
}

const sidebarItems = [
  { icon: Home, label: "Dashboard", path: "/dashboard" },
  { icon: MessageSquare, label: "Chat (File Complaint)", path: "/complaint" },
  { icon: FileText, label: "Solutions (Draft Letters)", path: "/letters" },
  { icon: BarChart3, label: "Analytics", path: "/analytics" },
  { icon: PieChart, label: "Risk Assessment", path: "/risk" },
  { icon: Users, label: "User Management", path: "/users" },
  { icon: Shield, label: "Compliance", path: "/compliance" },
  { icon: Settings, label: "Admin Panel", path: "/admin" },
];

export function Sidebar({ className, isOpen = true }: SidebarProps) {
  const pathname = usePathname();
  const [activeItem, setActiveItem] = useState(pathname || "/dashboard");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    setActiveItem(pathname || "/dashboard");
  }, [pathname]);

  return (
    <div
      className={cn(
        "flex h-full w-64 flex-col border-r bg-background transition-transform duration-200 ease-in-out",
        !isOpen && "-translate-x-full md:translate-x-0 md:w-16",
        className
      )}
    >
      <div className="flex-1 overflow-y-auto py-6">
        <nav className="space-y-2 px-3">
          {sidebarItems.map((item) => (
            <Button
              key={item.path}
              variant={activeItem === item.path ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-start gap-3 h-11",
                activeItem === item.path && "bg-primary/10 text-primary hover:bg-primary/20",
                !isOpen && "md:justify-center md:px-2"
              )}
              onClick={() => {
                setActiveItem(item.path);
                window.location.href = item.path;
              }}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {isOpen && (
                <span className="truncate">{item.label}</span>
              )}
            </Button>
          ))}
        </nav>
      </div>
    </div>
  );
}