import { Home, ClipboardList, LineChart, Settings, Wallet, Mail, Menu, Users, MessageSquare, Briefcase, Database, Heart, BrainCircuit } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { Logo } from "./Logo";

export function Sidebar() {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const links = [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'Tasks', href: '/tasks', icon: ClipboardList },
    { name: 'Marketplace', href: '/marketplace', icon: Briefcase },
    { name: 'Union', href: '/union', icon: Users },
    { name: 'Data Monetization', href: '/data-monetization', icon: Database },
    { name: 'Wellness', href: '/wellness', icon: Heart },
    { name: 'AI Chat', href: '/ai-chat', icon: BrainCircuit },
    { name: 'Discussions', href: '/discussions', icon: MessageSquare },
    { name: 'Wallet', href: '/wallet', icon: Wallet },
    { name: 'Inbox', href: '/inbox', icon: Mail },
    { name: 'Analytics', href: '/analytics', icon: LineChart },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <div className={cn(
      "flex flex-col border-r glass-effect transition-all duration-300",
      collapsed ? "w-16" : "w-64"
    )}>
      <div className="flex h-16 items-center border-b px-4">
        <Button variant="ghost" size="icon" onClick={() => setCollapsed(!collapsed)}
                className="hover:text-brand-500">
          <Menu className="h-5 w-5" />
        </Button>
        {!collapsed && <Logo className="ml-2" />}
      </div>
      <nav className="flex-1 space-y-2 p-4">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              to={link.href}
              className={cn(
                "flex items-center space-x-2 rounded-lg px-3 py-2 transition-colors hover-scale",
                location.pathname === link.href
                  ? "bg-brand-500 text-white"
                  : "hover:bg-brand-100 hover:text-brand-600"
              )}
            >
              <Icon className="h-5 w-5" />
              {!collapsed && <span>{link.name}</span>}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}