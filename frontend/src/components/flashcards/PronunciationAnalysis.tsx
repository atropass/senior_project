import { Card } from "@mantine/core";
import { CheckCircle, XCircle, AlertCircle } from "lucide-react";

// Define a more flexible interface that matches the actual data
interface PhonemeDetail {
  correct: boolean;
  phoneme: string;
  similarity: number;
  similar_to: string[];
  error?: string;
  predicted_as?: string;
}

interface PhonemeAnalysis {
  accuracy: number;
  correct_phonemes: number;
  phoneme_details: PhonemeDetail[];
  total_phonemes: number;
}

interface PronunciationResult {
  confidence: number;
  detailed_feedback: string[];
  phoneme_analysis: PhonemeAnalysis;
  predicted_text: string;
  pronunciation_score: number;
  reference_text: string;
  rhythm_metrics: {
    rhythm_regularity: number;
    speech_rate: number;
  };
  timing_scores: {
    mean_duration: number;
    std_duration: number;
    timing_score: number;
  };
}

interface PronunciationResultsProps {
  result: PronunciationResult;
}

const PronunciationAnalysis: React.FC<PronunciationResultsProps> = ({
  result,
}) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getPhonemeIcon = (correct: boolean, similarity: number) => {
    if (correct) {
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    } else if (similarity >= 0.7) {
      return <AlertCircle className="h-4 w-4 text-yellow-600" />;
    } else {
      return <XCircle className="h-4 w-4 text-red-600" />;
    }
  };

  const renderPhonemeStatus = (phoneme: PhonemeDetail) => {
    if (phoneme.correct) {
      return "Correct";
    } else {
      // For incorrect phonemes, check if we have predicted_as and similar_to fields
      if (phoneme.predicted_as) {
        return `Pronounced as "${phoneme.predicted_as}"`;
      } else if (phoneme.similar_to && phoneme.similar_to.length > 0) {
        return `Similar to ${phoneme.similar_to.join(", ")}`;
      } else {
        return "Incorrect";
      }
    }
  };

  return (
    <Card withBorder shadow="sm" radius="md" className="w-full">
      <div className="border-b px-4 py-5 sm:px-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">
            Pronunciation Assessment
          </h3>
          <div className="flex items-center">
            <span className="text-xs text-gray-600 mr-2">Overall Score:</span>
            <span
              className={`text-xl font-bold ${getScoreColor(
                result.pronunciation_score
              )}`}
            >
              {Math.round(result.pronunciation_score)}
            </span>
          </div>
        </div>
        <p className="mt-1 max-w-2xl text-xs text-gray-500">
          Word: <span className="font-medium">{result.reference_text}</span> |
          Detected: <span className="font-medium">{result.predicted_text}</span>
        </p>
      </div>

      <div className="px-4 py-5 sm:p-6">
        <div className="mb-6">
          <h4 className="text-base font-medium text-gray-900 mb-3">
            Phoneme Analysis
          </h4>
          <div className="bg-gray-50 rounded-md p-3 mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-medium">Accuracy:</span>
              <span
                className={`text-xs font-bold ${getScoreColor(
                  result.phoneme_analysis.accuracy
                )}`}
              >
                {result.phoneme_analysis.accuracy.toFixed(1)}%
              </span>
            </div>
            <div className="text-xs text-gray-500">
              {result.phoneme_analysis.correct_phonemes} of{" "}
              {result.phoneme_analysis.total_phonemes} phonemes correct
            </div>
          </div>

          <div className="grid grid-cols-5 gap-2 mb-2 text-xs font-medium text-gray-700">
            <div>Phoneme</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-2">Similarity</div>
          </div>

          <div className="space-y-2">
            {result.phoneme_analysis.phoneme_details.map((phoneme, index) => (
              <div
                key={index}
                className="grid grid-cols-5 gap-2 py-2 border-b border-gray-100 text-xs"
              >
                <div className="font-mono text-center font-medium bg-gray-100 rounded px-2 py-1">
                  {phoneme.phoneme}
                </div>
                <div className="col-span-2 flex items-center">
                  {getPhonemeIcon(phoneme.correct, phoneme.similarity)}
                  <span className="ml-2">{renderPhonemeStatus(phoneme)}</span>
                </div>
                <div className="col-span-2">
                  <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${getScoreColor(
                        phoneme.similarity * 100
                      )}`}
                      style={{ width: `${phoneme.similarity * 100}%` }}
                    />
                  </div>
                  <div className="text-xs text-right mt-1">
                    {(phoneme.similarity * 100).toFixed(0)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <h4 className="text-base font-medium text-gray-900 mb-3">
              Rhythm Metrics
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center h-14 px-3 py-2 bg-gray-50 rounded">
                <span className="text-xs">Speech Rate:</span>
                <span className="text-xs font-medium">
                  {result.rhythm_metrics.speech_rate.toFixed(2)} syllables/s
                </span>
              </div>
              <div className="flex justify-between items-center h-14  px-3 py-2 bg-gray-50 rounded">
                <span className="text-xs">Rhythm Regularity:</span>
                <span className="text-xs font-medium">
                  {(result.rhythm_metrics.rhythm_regularity * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-base font-medium text-gray-900 mb-3">
              Timing Scores
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center h-14 px-3 py-2 bg-gray-50 rounded">
                <span className="text-xs">Mean Duration:</span>
                <span className="text-xs font-medium">
                  {result.timing_scores.mean_duration.toFixed(2)} ms
                </span>
              </div>
              <div className="flex justify-between items-center h-14 px-3 py-2 bg-gray-50 rounded">
                <span className="text-xs">Std Deviation:</span>
                <span className="text-xs font-medium">
                  {result.timing_scores.std_duration.toFixed(2)} ms
                </span>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h4 className="text-base font-medium text-gray-900 mb-3">
            Detailed Feedback
          </h4>
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
            <ul className="space-y-2 text-xs text-gray-800">
              {result.detailed_feedback.map((feedback, index) => (
                <li key={index} className={index === 0 ? "font-medium" : ""}>
                  {feedback}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default PronunciationAnalysis;
