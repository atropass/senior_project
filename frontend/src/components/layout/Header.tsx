import React, { useState } from "react";
import { ChevronDown, User } from "lucide-react";
import { Select } from "@mantine/core";

interface HeaderProps {
  username?: string;
  userAvatar?: string;
}

const Header: React.FC<HeaderProps> = ({
  username = "John Doe",
  userAvatar,
}) => {
  const [selectedLanguage, setSelectedLanguage] = useState("English");

  const languages = ["English", "Spanish", "French", "German", "Japanese"];

  const selectLanguage = (lang: string) => {
    setSelectedLanguage(lang);
  };

  return (
    <header className="h-24 bg-white border-b border-gray-200 w-full flex items-center justify-between px-6">
      <Select
        data={languages}
        value={selectedLanguage}
        onChange={(value) => selectLanguage(value as string)}
        placeholder="Select language"
        rightSection={<ChevronDown size={16} />}
        className="w-48"
      />

      <div className="flex items-center space-x-3">
        <div className="text-right hidden sm:block">
          <div className="text-sm font-medium text-gray-900">{username}</div>
          <div className="text-xs text-gray-500">User</div>
        </div>

        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600">
          {userAvatar ? (
            <img
              src={userAvatar}
              alt={username}
              className="h-10 w-10 rounded-full object-cover"
            />
          ) : (
            <User size={20} />
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
