import { createStore, createEvent, createEffect, sample } from "effector";
import { AxiosError } from "axios";
import { speechService } from "../../../services";
import { ApiErrorResponse } from "../../../services/interfaces";
import { PronunciationResult } from "../../../interfaces/analysis";

export const analyzeSpeechFx = createEffect<
  { audioFile: File; wordId: number },
  PronunciationResult,
  AxiosError
>(async ({ audioFile, wordId }) => {
  const response = await speechService.analyzeSpeech(audioFile, wordId);
  return response.data;
});

export const speechRecorded = createEvent<{
  audioFile: File;
  wordId: number;
}>();
export const resetSpeechAnalysis = createEvent();

export const $speechAnalysisResult = createStore<PronunciationResult | null>(
  null
)
  .on(analyzeSpeechFx.doneData, (_, result) => result)
  .reset(resetSpeechAnalysis);

export const $speechAnalysisLoading = analyzeSpeechFx.pending;

export const $speechAnalysisError = createStore<string | null>(null)
  .on(
    analyzeSpeechFx.failData,
    (_, error) =>
      (error.response?.data as ApiErrorResponse)?.message ||
      "Failed to analyze speech"
  )
  .reset(resetSpeechAnalysis);

sample({
  clock: speechRecorded,
  target: analyzeSpeechFx,
});

analyzeSpeechFx.fail.watch(({ error }) => {
  console.error("Error analyzing speech:", error);
});
