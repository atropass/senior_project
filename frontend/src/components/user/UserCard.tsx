import { Card } from "@mantine/core";
import { User } from "lucide-react";

interface UserCardProps {
  username: string;
  email: string;
  createdAt: Date;
}

export const UserCard: React.FC<UserCardProps> = ({
  username,
  email,
  createdAt,
}) => {
  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  };

  return (
    <Card withBorder shadow="md" p={30} mt={30} radius="md">
      <div className="flex items-center mb-4">
        <div className="bg-gray-200 rounded-full p-2 mr-4">
          <User className="h-10 w-10 text-gray-500" />
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-800">{username}</h2>
          <p className="text-sm text-gray-500">{email}</p>
        </div>
      </div>

      <div className="border-t border-gray-200 pt-4">
        <div className="flex items-center">
          <span className="text-xs text-gray-500">Member since:</span>
          <span className="text-xs ml-2 font-medium text-gray-700">
            {formatDate(createdAt)}
          </span>
        </div>
      </div>
    </Card>
  );
};
