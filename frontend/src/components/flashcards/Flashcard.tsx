import React, { useState } from "react";
import {
  Card,
  Badge,
  Button,
  Text,
  // Image,
  Stack,
  Group,
  ActionIcon,
  Tooltip,
} from "@mantine/core";
import {
  Volume2,
  RotateCw,
  ChevronLeft,
  ChevronRight,
  Heart,
  BookOpen,
  Mic,
} from "lucide-react";
import { motion } from "framer-motion";

interface FlashcardData {
  word_id: number;
  word: string;
  categories: string[];
  picture: string;
  eng_translation: string;
  rus_translation: string;
  phonetic: string;
  audio: string;
}

interface FlashCardProps {
  card: FlashcardData;
  onNext?: () => void;
  onPrevious?: () => void;
  onPractice?: () => void;
}

const FlashCard: React.FC<FlashCardProps> = ({
  card,
  onNext,
  onPrevious,
  onPractice,
}) => {
  const [flipped, setFlipped] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  const playAudio = () => {
    const audio = new Audio(`/audio/${card.audio}`);
    audio.play();
  };

  const flipCard = () => {
    setFlipped(!flipped);
  };

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
  };

  return (
    <div className="w-full max-w-xl mx-auto perspective-1000">
      <motion.div
        className="w-full relative preserve-3d"
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{
          duration: 0.6,
          type: "spring",
          stiffness: 300,
          damping: 30,
        }}
        style={{ transformStyle: "preserve-3d" }}
      >
        <motion.div
          style={{
            backfaceVisibility: "hidden",
            position: flipped ? "absolute" : "relative",
            width: "100%",
            height: "100%",
            top: 0,
            left: 0,
          }}
        >
          <Card
            shadow="sm"
            p="lg"
            radius="md"
            withBorder
            style={{ minHeight: "400px" }}
          >
            <Group justify="space-between" mb="md">
              <Group>
                {card.categories.map((category, index) => (
                  <Badge key={index} color="blue" variant="light">
                    {category}
                  </Badge>
                ))}
              </Group>
              <ActionIcon
                variant="subtle"
                color={isFavorite ? "red" : "gray"}
                onClick={toggleFavorite}
              >
                <Heart size={18} fill={isFavorite ? "red" : "none"} />
              </ActionIcon>
            </Group>

            <div
              className="flex justify-center items-center"
              style={{ minHeight: "280px" }}
            >
              <Stack align="center" gap="xs">
                {/* <Image
                  src={`/images/${card.picture}`}
                  alt={card.word}
                  height={150}
                  width={150}
                  fit="contain"
                /> */}
                <p className="text-4xl font-bold">{card.word}</p>
                <Group justify="center" mt="xs">
                  <Tooltip label="Listen to pronunciation">
                    <ActionIcon
                      size="lg"
                      color="blue"
                      variant="light"
                      disabled={card.audio === "default.wav"}
                      onClick={playAudio}
                    >
                      <Volume2 size={20} />
                    </ActionIcon>
                  </Tooltip>
                  {onPractice && (
                    <Tooltip label="Practice pronunciation">
                      <ActionIcon
                        size="lg"
                        color="green"
                        variant="light"
                        onClick={onPractice}
                      >
                        <Mic size={20} />
                      </ActionIcon>
                    </Tooltip>
                  )}
                </Group>
              </Stack>
            </div>

            <Group justify="space-between" mt="xl">
              <Button
                variant="subtle"
                leftSection={<ChevronLeft size={14} />}
                onClick={onPrevious}
              >
                Previous
              </Button>
              <Group gap="xs">
                <Button
                  variant="light"
                  color="blue"
                  onClick={flipCard}
                  rightSection={<RotateCw size={14} />}
                >
                  Show Details
                </Button>
                <Tooltip label="Add to flashcards">
                  <ActionIcon size="lg" color="teal" variant="light">
                    <BookOpen size={20} />
                  </ActionIcon>
                </Tooltip>
              </Group>
              <Button
                variant="subtle"
                rightSection={<ChevronRight size={14} />}
                onClick={onNext}
              >
                Next
              </Button>
            </Group>
          </Card>
        </motion.div>

        {/* Back of card */}
        <motion.div
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
            position: !flipped ? "absolute" : "relative",
            width: "100%",
            height: "100%",
            top: 0,
            left: 0,
          }}
        >
          <Card
            shadow="sm"
            p="lg"
            radius="md"
            withBorder
            style={{ minHeight: "400px" }}
          >
            <Group justify="space-between" mb="md">
              <Group>
                {card.categories.map((category, index) => (
                  <Badge key={index} color="blue" variant="light">
                    {category}
                  </Badge>
                ))}
              </Group>
              <ActionIcon
                variant="subtle"
                color={isFavorite ? "red" : "gray"}
                onClick={toggleFavorite}
              >
                <Heart size={18} fill={isFavorite ? "red" : "none"} />
              </ActionIcon>
            </Group>

            <div
              className="flex justify-center items-center"
              style={{ minHeight: "280px" }}
            >
              <Stack align="center" gap="lg">
                <Text size="xl" fw={700} ta="center">
                  {card.word}
                </Text>
                <Text size="md" c="dimmed" ta="center">
                  [{card.phonetic}]
                </Text>
                <Group justify="center" gap="xl">
                  <div>
                    <Text size="sm" c="dimmed">
                      English
                    </Text>
                    <Text>{card.eng_translation}</Text>
                  </div>
                  <div>
                    <Text size="sm" c="dimmed">
                      Russian
                    </Text>
                    <Text>{card.rus_translation}</Text>
                  </div>
                </Group>
                <Group justify="center" mt="xs">
                  <Tooltip label="Listen to pronunciation">
                    <ActionIcon
                      size="lg"
                      color="blue"
                      variant="light"
                      onClick={playAudio}
                    >
                      <Volume2 size={20} />
                    </ActionIcon>
                  </Tooltip>
                  {onPractice && (
                    <Tooltip label="Practice pronunciation">
                      <ActionIcon
                        size="lg"
                        color="green"
                        variant="light"
                        onClick={onPractice}
                      >
                        <Mic size={20} />
                      </ActionIcon>
                    </Tooltip>
                  )}
                </Group>
              </Stack>
            </div>

            <Group justify="space-between" mt="xl">
              <Button
                variant="subtle"
                leftSection={<ChevronLeft size={14} />}
                onClick={onPrevious}
              >
                Previous
              </Button>
              <Group gap="xs">
                <Button
                  variant="light"
                  color="blue"
                  onClick={flipCard}
                  rightSection={<RotateCw size={14} />}
                >
                  Show Word
                </Button>
                <Tooltip label="Add to flashcards">
                  <ActionIcon size="lg" color="teal" variant="light">
                    <BookOpen size={20} />
                  </ActionIcon>
                </Tooltip>
              </Group>
              <Button
                variant="subtle"
                rightSection={<ChevronRight size={14} />}
                onClick={onNext}
              >
                Next
              </Button>
            </Group>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
};

export { FlashCard };
