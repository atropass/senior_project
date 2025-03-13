import { useState } from "react";
import {
  Container,
  Paper,
  Title,
  Divider,
  SimpleGrid,
  ActionIcon,
  Text,
  Alert,
} from "@mantine/core";
import { X, AlertCircle } from "lucide-react";

import CategoryCard from "./CategoryCard";
import FlashCardPreview, { FlashCardPreviewSkeleton } from "./FlashCardPreview";
import { useUnit } from "effector-react";
import { $categories } from "../../features/categories/get-categories";
import {
  $flashcardsByCategory,
  $flashcardsByCategoryLoading,
  $flashcardsByCategoryError,
  categorySelected,
} from "../../features/categories/get-category";
import { Category } from "../../interfaces";

const CATEGORY_COLORS = [
  "blue",
  "teal",
  "green",
  "yellow",
  "orange",
  "red",
  "pink",
  "grape",
  "violet",
  "indigo",
];

const CategoriesList = () => {
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );

  const [categories, flashcardsByCategory, isLoading, error, selectCategory] =
    useUnit([
      $categories,
      $flashcardsByCategory,
      $flashcardsByCategoryLoading,
      $flashcardsByCategoryError,
      categorySelected,
    ]);

  const gridResponsiveProps = {
    cols: 3,
    breakpoints: [
      { maxWidth: "62rem", cols: 2 },
      { maxWidth: "48rem", cols: 1 },
    ],
  };

  const flashcardsGridProps = {
    cols: 3,
    breakpoints: [
      { maxWidth: "74rem", cols: 2 },
      { maxWidth: "48rem", cols: 1 },
    ],
  };

  const handleCategorySelect = (category: Category) => {
    setSelectedCategory(category);
    selectCategory(category.category_id);
  };

  const getCategoryColor = (categoryId: number) => {
    const colorIndex = categoryId % CATEGORY_COLORS.length;
    return CATEGORY_COLORS[colorIndex];
  };

  return (
    <Container size="xl" py="xl">
      <p className="mb-6">
        <Title order={2}>Categories</Title>
      </p>

      <SimpleGrid {...gridResponsiveProps} spacing="md" className="mb-8">
        {categories.map((category) => (
          <CategoryCard
            key={category.category_id}
            category={category}
            onClick={(category) => handleCategorySelect(category)}
            colorName={getCategoryColor(category.category_id)}
          />
        ))}
      </SimpleGrid>

      {selectedCategory && (
        <div className="transition-opacity duration-400 ease-in-out">
          <Paper
            p="md"
            radius="md"
            withBorder
            style={{
              borderColor: `var(--mantine-color-${getCategoryColor(
                selectedCategory.category_id
              )}-5)`,
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <Title order={3}>{selectedCategory.name}</Title>
              </div>
              <ActionIcon
                variant="subtle"
                onClick={() => setSelectedCategory(null)}
              >
                <X size={18} />
              </ActionIcon>
            </div>

            <Divider className="mb-4" />

            {error && (
              <Alert
                icon={<AlertCircle size={16} />}
                title="Error loading flashcards"
                color="red"
                mb="md"
              >
                {error}
              </Alert>
            )}

            {isLoading ? (
              <div>
                <SimpleGrid {...flashcardsGridProps} spacing="md">
                  {Array(6)
                    .fill(0)
                    .map((_, index) => (
                      <FlashCardPreviewSkeleton key={index} />
                    ))}
                </SimpleGrid>
              </div>
            ) : flashcardsByCategory.length === 0 && !error ? (
              <div className="text-center py-8">
                <Text c="dimmed">No flashcards found for this category</Text>
              </div>
            ) : (
              <SimpleGrid {...flashcardsGridProps} spacing="md">
                {flashcardsByCategory.map((flashcard) => (
                  <FlashCardPreview
                    key={flashcard.word_id}
                    flashcard={flashcard}
                    colorName={getCategoryColor(selectedCategory.category_id)}
                  />
                ))}
              </SimpleGrid>
            )}
          </Paper>
        </div>
      )}
    </Container>
  );
};

export default CategoriesList;
