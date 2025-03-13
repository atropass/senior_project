import React from "react";
import {
  Paper,
  Text,
  Badge,
  Group,
  ThemeIcon,
  Stack,
  Skeleton,
  ActionIcon,
  Tooltip,
} from "@mantine/core";
import { Book, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Flashcard } from "../../interfaces";
import ReactCountryFlag from "react-country-flag";

interface FlashcardPreviewProps {
  flashcard: Flashcard;
  colorName: string;
}

const FlashCardPreview: React.FC<FlashcardPreviewProps> = ({
  flashcard,
  colorName,
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/flashcards/${flashcard.word_id}`);
  };

  const handleViewDetails = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click event
    navigate(`/flashcards/${flashcard.word}`);
  };

  return (
    <Paper
      p="md"
      withBorder
      radius="md"
      className="transition duration-200 hover:shadow-md hover:scale-102 cursor-pointer"
      onClick={handleClick}
      style={{
        borderColor: `var(--mantine-color-${colorName}-3)`,
        borderLeftWidth: "3px",
      }}
    >
      <Stack gap="xs">
        <Group justify="space-between">
          <Text size="lg" fw={500}>
            {flashcard.word}
          </Text>
          <Group gap="xs">
            <Tooltip label="View flashcard details">
              <ActionIcon
                color={colorName}
                variant="light"
                size="md"
                radius="xl"
                onClick={handleViewDetails}
              >
                <Eye size={16} />
              </ActionIcon>
            </Tooltip>
            <ThemeIcon color={colorName} variant="light" size="md" radius="xl">
              <Book size={16} />
            </ThemeIcon>
          </Group>
        </Group>

        <Text size="sm" c="dimmed">
          {flashcard.phonetic ? (
            <span className="font-arimo">{flashcard.phonetic}</span>
          ) : (
            "No phonetic transcription"
          )}
        </Text>

        <Group gap="xs" align="center">
          <ReactCountryFlag
            countryCode="GB"
            svg
            style={{
              width: "1em",
              height: "1em",
            }}
            title="UK"
          />
          <Text size="sm">{flashcard.eng_translation}</Text>
        </Group>

        <Group gap="xs" align="center">
          <ReactCountryFlag
            countryCode="RU"
            svg
            style={{
              width: "1em",
              height: "1em",
            }}
            title="Russia"
          />
          <Text size="sm" c="dimmed">
            {flashcard.rus_translation}
          </Text>
        </Group>

        {flashcard.categories && flashcard.categories.length > 0 && (
          <Group mt={5} gap="xs">
            {flashcard.categories.map((category, index) => (
              <Badge key={index} color={colorName} variant="light" size="sm">
                {category}
              </Badge>
            ))}
          </Group>
        )}
      </Stack>
    </Paper>
  );
};

export const FlashCardPreviewSkeleton = () => (
  <Paper p="md" withBorder radius="md">
    <Stack gap="xs">
      <Group justify="space-between">
        <Skeleton height={24} width="40%" radius="sm" />
        <Skeleton height={24} width={24} radius="xl" />
      </Group>
      <Skeleton height={16} width="30%" radius="sm" />
      <Skeleton height={16} width="70%" radius="sm" />
      <Skeleton height={16} width="60%" radius="sm" />
      <Group mt={5} gap="xs">
        <Skeleton height={18} width={60} radius="xl" />
        <Skeleton height={18} width={80} radius="xl" />
      </Group>
    </Stack>
  </Paper>
);

export default FlashCardPreview;
