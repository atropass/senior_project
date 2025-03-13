import React from "react";
import { Card, Text } from "@mantine/core";
import { Category } from "../../interfaces";

interface CategoryCardProps {
  category: Category;
  onClick: (category: Category) => void;
  colorName: string; // Added color name prop
}

const CategoryCard: React.FC<CategoryCardProps> = ({
  category,
  onClick,
  colorName,
}) => {
  return (
    <Card
      p="md"
      radius="md"
      withBorder
      className="transition duration-200 hover:scale-105 hover:cursor-pointer"
      style={{
        borderColor: `var(--mantine-color-${colorName}-5)`,
        backgroundColor: `var(--mantine-color-${colorName}-0)`,
      }}
      onClick={() => onClick(category)}
    >
      <div className="flex justify-between items-center mb-2">
        <Text fw={500}>{category.name}</Text>
        <div
          className="h-8 w-8 rounded-md flex items-center justify-center"
          style={{ backgroundColor: `var(--mantine-color-${colorName}-5)` }}
        >
          <Text c="white" fw={700}>
            {category.name.charAt(0).toUpperCase()}
          </Text>
        </div>
      </div>
    </Card>
  );
};

export default CategoryCard;
