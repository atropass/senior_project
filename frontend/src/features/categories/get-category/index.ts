import { createStore, createEvent, createEffect, sample } from "effector";
import { AxiosError } from "axios";
import { Flashcard } from "../../../interfaces";
import { flashcardService } from "../../../services";
import { ApiErrorResponse } from "../../../services/interfaces";

export const getFlashcardsByCategoryFx = createEffect<
  number,
  Flashcard[],
  AxiosError
>(async (categoryId) => {
  const response = await flashcardService.getFlashcardsByCategory(categoryId);
  return response.data.flashcards;
});

export const categorySelected = createEvent<number>();
export const resetFlashcardsByCategory = createEvent();

export const $flashcardsByCategory = createStore<Flashcard[]>([])
  .on(getFlashcardsByCategoryFx.doneData, (_, flashcards) => flashcards)
  .reset(resetFlashcardsByCategory);

export const $flashcardsByCategoryLoading = getFlashcardsByCategoryFx.pending;

export const $flashcardsByCategoryError = createStore<string | null>(null)
  .on(
    getFlashcardsByCategoryFx.failData,
    (_, error) =>
      (error.response?.data as ApiErrorResponse)?.message ||
      "Failed to load flashcards"
  )
  .reset(resetFlashcardsByCategory);

sample({
  clock: categorySelected,
  target: getFlashcardsByCategoryFx,
});

getFlashcardsByCategoryFx.fail.watch(({ error }) => {
  console.error("Error fetching flashcards by category:", error);
});
