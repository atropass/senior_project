import { createStore, createEffect, createEvent, sample } from "effector";
import { AxiosError } from "axios";
import { categoryService } from "../../../services";
import { CategoriesResponse, Category } from "../../../interfaces";
import { createGate } from "effector-react";

export const getAllCategoriesFx = createEffect<
  void,
  CategoriesResponse,
  AxiosError
>(async () => {
  const response = await categoryService.getAllCategories();
  return response.data;
});

export const CategoriesGate = createGate();

export const fetchCategoriesRequested = createEvent();
export const resetCategoriesState = createEvent();

export const $categoriesPending = getAllCategoriesFx.pending;
export const $categoriesError = createStore<string | null>(null)
  .on(getAllCategoriesFx.failData, (_, error) => {
    const data = error.response?.data as { message: string };
    return data?.message || "Failed to fetch categories";
  })
  .reset(resetCategoriesState);

export const $categories = createStore<Category[]>([])
  .on(getAllCategoriesFx.doneData, (_, data) => data.categories)
  .reset(resetCategoriesState);

fetchCategoriesRequested.watch(() => {
  getAllCategoriesFx();
});

getAllCategoriesFx.fail.watch(({ error }) => {
  console.error("Categories fetch error:", error);
});

getAllCategoriesFx.done.watch(({ result }) => {
  console.log("Categories fetched successfully:", result.categories.length);
});

sample({
  source: CategoriesGate.open,
  target: getAllCategoriesFx,
});
