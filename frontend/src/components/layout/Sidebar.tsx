import React from "react";
import { BookOpen, Settings, History, LogOut } from "lucide-react";

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  isActive?: boolean;
  isHighlighted?: boolean;
  onClick?: () => void;
}

const SidebarItem: React.FC<SidebarItemProps> = ({
  icon,
  label,
  isHighlighted = false,
  isActive = false,
  onClick,
}) => {
  return (
    <div
      className={`flex items-center p-3 my-1 rounded-lg cursor-pointer transition-colors ${
        isActive
          ? "bg-blue-100 text-blue-600"
          : "hover:bg-gray-100 text-gray-700"
      }
        ${
          isHighlighted &&
          "bg-blue-600 text-white drop-shadow-md hover:bg-blue-500 border"
        }
      `}
      onClick={onClick}
    >
      <div className="mr-3">{icon}</div>
      <span className="text-sm">{label}</span>
    </div>
  );
};

interface SidebarProps {
  onNavigate?: (route: string) => void;
  onLogout?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onNavigate, onLogout }) => {
  return (
    <div className="h-screen w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="border-gray-200 h-20 flex items-center justify-center">
        <h1 className="text-xl font-bold text-gray-800">Application</h1>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div>
          <SidebarItem
            icon={<BookOpen size={20} />}
            label="Learn"
            isHighlighted={true}
            onClick={() => onNavigate?.("learn")}
          />
        </div>

        <SidebarItem
          icon={<Settings size={20} />}
          label="Settings"
          onClick={() => onNavigate?.("settings")}
        />

        <SidebarItem
          icon={<History size={20} />}
          label="History"
          onClick={() => onNavigate?.("history")}
        />
      </div>

      <div className="p-2 border-t border-gray-200">
        <SidebarItem
          icon={<LogOut size={20} />}
          label="Logout"
          onClick={onLogout}
        />
      </div>
    </div>
  );
};

export default Sidebar;
