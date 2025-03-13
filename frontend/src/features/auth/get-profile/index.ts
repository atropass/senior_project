import { createStore, createEffect, createEvent } from "effector";
import { AxiosError } from "axios";
import { ApiErrorResponse } from "../../../services/interfaces";
import { User } from "../../../interfaces";
import { authService } from "../../../services";

export const getProfileFx = createEffect<void, User, AxiosError>(async () => {
  const response = await authService.getProfile();
  return response.data;
});

export const resetProfileState = createEvent();
export const fetchProfileRequested = createEvent();

export const $profilePending = getProfileFx.pending;
export const $profileError = createStore<string | null>(null)
  .on(
    getProfileFx.failData,
    (_, error) =>
      (error.response?.data as ApiErrorResponse).message ||
      "Failed to fetch profile"
  )
  .reset(resetProfileState);

export const $profile = createStore<User | null>(null)
  .on(getProfileFx.doneData, (_, data) => data)
  .reset(resetProfileState);

fetchProfileRequested.watch(() => {
  getProfileFx();
});

getProfileFx.fail.watch(({ error }) => {
  console.error("Profile fetch error:", error);

  // If unauthorized (401), clear token
  if (error.response?.status === 401) {
    localStorage.removeItem("token");
  }
});
