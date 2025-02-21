import React from "react";
import { User, Users, Database, Shield, HelpCircle, Menu } from "lucide-react";
import clsx from "clsx";
import trust from "../Trustnet.png";

const navItems = [
  { id: "profile", icon: User, label: "Profile" },
  { id: "references", icon: Users, label: "References" },
  { id: "datasources", icon: Database, label: "Data Sources" },
  { id: "privacy", icon: Shield, label: "Privacy" },
  { id: "support", icon: HelpCircle, label: "Support" },
];

type SidebarProps = {
  onSectionChange: (section: string) => void;
  activeSection: string;
};

export function Sidebar({ onSectionChange, activeSection }: SidebarProps) {
  const [isOpen, setIsOpen] = React.useState(true);

  return (
    <>
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 text-white hover:text-primary"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Menu size={24} />
      </button>

      <aside
        className={clsx(
          "fixed top-0 left-0 h-full bg-sidebar w-64 p-6 transition-transform duration-300 z-40",
          "lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center gap-2 mb-8">
          <img src={trust} alt="logo" className="w-10 h-10 object-contain" />
          <h1 className="text-2xl font-bold text-primary">AI TrustQuick</h1>
        </div>

        <nav className="space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                onSectionChange(item.id);
                setIsOpen(false);
              }}
              className={clsx(
                "w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors",
                "hover:bg-white/10",
                activeSection === item.id &&
                  "bg-white/5 border-l-4 border-primary"
              )}
            >
              <item.icon
                size={20}
                className={
                  activeSection === item.id ? "text-primary" : "text-white"
                }
              />
              <span
                className={
                  activeSection === item.id ? "text-primary" : "text-white"
                }
              >
                {item.label}
              </span>
            </button>
          ))}
        </nav>
      </aside>
    </>
  );
}
