import { createStore, createEvent, createEffect, sample } from "effector";
import { AxiosError } from "axios";
import { flashcardService } from "../../../services";
import { Flashcard } from "../../../interfaces";
import { ApiErrorResponse } from "../../../services/interfaces";

export const getFlashcardByWordFx = createEffect<string, Flashcard, AxiosError>(
  async (word) => {
    const response = await flashcardService.getFlashcardByWord(word);
    return response.data.flashcard;
  }
);

export const wordSelected = createEvent<string>();
export const resetFlashcardState = createEvent();

export const $currentFlashcard = createStore<Flashcard | null>(null)
  .on(getFlashcardByWordFx.doneData, (_, flashcard) => flashcard)
  .reset(resetFlashcardState);

export const $isLoading = getFlashcardByWordFx.pending;

export const $error = createStore<string | null>(null)
  .on(
    getFlashcardByWordFx.failData,
    (_, error) =>
      (error.response?.data as ApiErrorResponse)?.message ||
      "Failed to load flashcard"
  )
  .reset(resetFlashcardState);

sample({
  clock: wordSelected,
  target: getFlashcardByWordFx,
});

getFlashcardByWordFx.fail.watch(({ error }) => {
  console.error("Error fetching flashcard by word:", error);
});
