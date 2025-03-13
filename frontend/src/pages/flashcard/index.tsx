import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Loader,
  Center,
  Button,
  Alert,
  Paper,
  Text,
  Grid,
  Box,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useUnit } from "effector-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  $currentFlashcard,
  $isLoading,
  $error,
  wordSelected,
  resetFlashcardState,
} from "../../features/flashcards/get-flashcard-word";
import {
  $speechAnalysisLoading,
  $speechAnalysisError,
  speechRecorded,
  resetSpeechAnalysis,
} from "../../features/flashcards/analyze-speech";
import { AlertCircle, ChevronLeft } from "lucide-react";
import { FlashCard } from "../../components/flashcards/Flashcard";
import VoiceRecorder from "../../components/flashcards/VoiceRecorder";
import PronunciationAnalysis from "../../components/flashcards/PronunciationAnalysis";

const FlashcardPage: React.FC = () => {
  const { word } = useParams<{ word: string }>();
  const navigate = useNavigate();
  const [showRecorder, setShowRecorder] = useState(false);
  const [panelHeight, setPanelHeight] = useState<number | null>(null);

  const [flashcard, isLoading, error, selectWord, resetFlashcard] = useUnit([
    $currentFlashcard,
    $isLoading,
    $error,
    wordSelected,
    resetFlashcardState,
  ]);

  const [
    // speechResult
    speechLoading,
    speechError,
    recordSpeech,
    resetSpeech,
  ] = useUnit([
    //   $speechAnalysisResult,
    $speechAnalysisLoading,
    $speechAnalysisError,
    speechRecorded,
    resetSpeechAnalysis,
  ]);

  const speechResult = {
    confidence: 0.9960978627204895,
    detailed_feedback: [
      "Good pronunciation. Some areas need work.",
      "\nPhoneme Issues:",
      "- 'ы' was pronounced as 'и'",
      "  (Similar acceptable sounds: і, и)",
      "\nTiming:",
      "- Work on maintaining consistent timing between sounds",
      "\nPace:",
      "- Try speaking more slowly and deliberately",
    ],
    phoneme_analysis: {
      accuracy: 80.0,
      correct_phonemes: 4,
      phoneme_details: [
        {
          correct: true,
          phoneme: "ж",
          similar_to: [],
          similarity: 1.0,
        },
        {
          correct: true,
          phoneme: "а",
          similar_to: [],
          similarity: 1.0,
        },
        {
          correct: true,
          phoneme: "қ",
          similar_to: [],
          similarity: 1.0,
        },
        {
          correct: true,
          phoneme: "с",
          similar_to: [],
          similarity: 1.0,
        },
        {
          correct: false,
          error: "mispronounciation",
          phoneme: "ы",
          predicted_as: "и",
          similar_to: ["і", "и"],
          similarity: 0.5,
        },
      ],
      total_phonemes: 5,
    },
    predicted_text: "жақси",
    pronunciation_score: 74.3519354895569,
    reference_text: "жақсы",
    rhythm_metrics: {
      rhythm_regularity: 0.16873335947051946,
      speech_rate: 7.517550163064507,
    },
    timing_scores: {
      mean_duration: 2.4888890881255468,
      std_duration: 15.443181656194563,
      timing_score: -1.0,
    },
  };

  // Reference to measure flashcard height
  const flashcardRef = React.useRef<HTMLDivElement>(null);

  // Update panel height when flashcard height changes
  useEffect(() => {
    if (flashcardRef.current) {
      const updateHeight = () => {
        if (flashcardRef.current) {
          setPanelHeight(flashcardRef.current.offsetHeight);
        }
      };

      // Initial measurement
      updateHeight();

      // Set up resize observer
      const resizeObserver = new ResizeObserver(updateHeight);
      resizeObserver.observe(flashcardRef.current);

      return () => {
        if (flashcardRef.current) {
          resizeObserver.unobserve(flashcardRef.current);
        }
      };
    }
  }, [flashcard]);

  // Monitor for flashcard errors
  useEffect(() => {
    if (error) {
      notifications.show({
        title: "Error Loading Flashcard",
        message: error,
        color: "red",
        autoClose: 5000,
      });
    }
  }, [error]);

  // Monitor for speech analysis errors
  useEffect(() => {
    if (speechError) {
      notifications.show({
        title: "Speech Analysis Error",
        message: speechError,
        color: "red",
        autoClose: 5000,
      });
    }
  }, [speechError]);

  useEffect(() => {
    if (speechResult && !speechLoading) {
      notifications.show({
        title: "Analysis Complete",
        message: `Pronunciation score: ${Math.round(
          speechResult.pronunciation_score
        )}%`,
        color:
          speechResult.pronunciation_score > 80
            ? "green"
            : speechResult.pronunciation_score > 60
            ? "yellow"
            : "red",
        autoClose: 3000,
      });
    }
  }, [speechResult, speechLoading]);

  // Close loading notification when analysis completes
  useEffect(() => {
    if (!speechLoading) {
      notifications.hide("analyzing-notification");
    }
  }, [speechLoading]);

  useEffect(() => {
    if (word) {
      selectWord(decodeURIComponent(word));
    }

    return () => {
      resetFlashcard();
      resetSpeech();
    };
  }, [word, selectWord, resetFlashcard, resetSpeech]);

  const handleGoBack = () => {
    navigate("/learn");
  };

  const handleNextCard = () => {
    if (flashcard) {
      resetSpeech();
      setShowRecorder(false);
      navigate(`/flashcards/${flashcard.word_id + 1}`);
    }
  };

  const handlePreviousCard = () => {
    if (flashcard && flashcard.word_id > 1) {
      resetSpeech();
      setShowRecorder(false);
      navigate(`/flashcards/${flashcard.word_id - 1}`);
    }
  };

  const handlePractice = () => {
    setShowRecorder(!showRecorder);
    if (showRecorder) {
      resetSpeech();
    }
  };

  const handleRecordingComplete = useCallback(
    (audioFile: File) => {
      if (flashcard) {
        resetSpeech();
        recordSpeech({ audioFile, wordId: flashcard.word_id });

        // Show analyzing notification
        notifications.show({
          title: "Analyzing Pronunciation",
          message: "Please wait while we analyze your recording...",
          loading: true,
          autoClose: false,
          withCloseButton: false,
          id: "analyzing-notification",
        });
      }
    },
    [flashcard, recordSpeech, resetSpeech]
  );

  if (isLoading) {
    return (
      <Container size="xl" py="xl">
        <Center style={{ height: "50vh" }}>
          <Loader size="lg" />
        </Center>
      </Container>
    );
  }

  if (error) {
    return (
      <Container size="xl" py="xl">
        <Alert
          icon={<AlertCircle size={18} />}
          title="Error"
          color="red"
          variant="filled"
        >
          {error}
        </Alert>
        <Button
          leftSection={<ChevronLeft size={14} />}
          onClick={handleGoBack}
          mt="md"
        >
          Go Back
        </Button>
      </Container>
    );
  }

  if (!flashcard) {
    return (
      <Container size="xl" py="xl">
        <Alert
          icon={<AlertCircle size={18} />}
          title="Not Found"
          color="yellow"
          variant="filled"
        >
          Flashcard not found
        </Alert>
        <Button
          leftSection={<ChevronLeft size={14} />}
          onClick={handleGoBack}
          mt="md"
        >
          Go Back
        </Button>
      </Container>
    );
  }

  return (
    <Container size="xl" py="xl">
      <Button
        variant="subtle"
        leftSection={<ChevronLeft size={14} />}
        onClick={handleGoBack}
        mb="lg"
      >
        Back to Flashcards
      </Button>

      <Grid gutter="md">
        <Grid.Col span={showRecorder ? 6 : 12}>
          <motion.div
            layout
            transition={{ type: "spring", stiffness: 1000, damping: 50 }}
            ref={flashcardRef}
          >
            <FlashCard
              card={flashcard}
              onNext={handleNextCard}
              onPrevious={handlePreviousCard}
              onPractice={handlePractice}
            />
          </motion.div>
        </Grid.Col>

        <AnimatePresence>
          {showRecorder && (
            <Grid.Col span={5}>
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 50 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              >
                <Paper
                  withBorder
                  p="md"
                  radius="md"
                  shadow="sm"
                  style={{
                    height: panelHeight ? `${panelHeight}px` : "auto",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <AnimatePresence mode="wait">
                    {!speechResult || speechLoading ? (
                      <motion.div
                        key="recorder"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{ height: "100%" }}
                      >
                        <VoiceRecorder
                          onRecordingComplete={handleRecordingComplete}
                        />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="results"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{ height: "100%", overflowY: "auto" }}
                      >
                        <Box className="flex justify-between items-center mb-4">
                          <Text size="xl" fw={500}>
                            Analysis Results
                          </Text>
                          <Button
                            variant="subtle"
                            size="sm"
                            onClick={() => {
                              resetSpeech();
                            }}
                          >
                            Try Again
                          </Button>
                        </Box>
                        <PronunciationAnalysis result={speechResult} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Paper>
              </motion.div>
            </Grid.Col>
          )}
        </AnimatePresence>
      </Grid>
    </Container>
  );
};

export default FlashcardPage;
