// Common properties for all phoneme details
interface BasePhonemeDetail {
  phoneme: string;
  similarity: number;
  similar_to: string[];
}

// For correctly pronounced phonemes
interface CorrectPhonemeDetail extends BasePhonemeDetail {
  correct: boolean; // Changed from 'true' to boolean
  // No additional fields for correct pronunciation
}

// For incorrectly pronounced phonemes
interface IncorrectPhonemeDetail extends BasePhonemeDetail {
  correct: boolean; // Changed from 'false' to boolean
  error?: string;
  predicted_as?: string;
}

// Union type to handle both cases
export type PhonemeDetail = CorrectPhonemeDetail | IncorrectPhonemeDetail;

export interface PhonemeAnalysis {
  accuracy: number;
  correct_phonemes: number;
  phoneme_details: PhonemeDetail[];
  total_phonemes: number;
}

export interface RhythmMetrics {
  rhythm_regularity: number;
  speech_rate: number;
}

export interface TimingScores {
  mean_duration: number;
  std_duration: number;
  timing_score: number;
}

export interface PronunciationResult {
  confidence: number;
  detailed_feedback: string[];
  phoneme_analysis: PhonemeAnalysis;
  predicted_text: string;
  pronunciation_score: number;
  reference_text: string;
  rhythm_metrics: RhythmMetrics;
  timing_scores: TimingScores;
}
