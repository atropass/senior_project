import { createEffect, createEvent, createStore, sample } from "effector";
import { AxiosError } from "axios";
import { RegisterUserData } from "../../../interfaces";
import { authService } from "../../../services";
import { ApiErrorResponse } from "../../../services/interfaces";

// Effect to handle registration API call
export const registerFx = createEffect<
  RegisterUserData,
  { message: string },
  AxiosError
>(async (userData) => {
  const response = await authService.register(userData);
  return response.data;
});

// Events
export const registerFormSubmitted = createEvent<RegisterUserData>();
export const resetRegisterState = createEvent();
export const navigateToLogin = createEvent();

// Stores
export const $registerPending = registerFx.pending;
export const $registerSuccess = createStore(false)
  .on(registerFx.done, () => true)
  .on(registerFx.fail, () => false)
  .reset(resetRegisterState);

// Register form submission flow
sample({
  clock: registerFormSubmitted,
  target: registerFx,
});

// Navigate on successful registration
sample({
  clock: registerFx.done,
  target: navigateToLogin,
});

// Logging for debugging
registerFx.done.watch(({ result }) => {
  console.log("Registration successful:", result.message);
});

registerFx.fail.watch(({ error }) => {
  console.error(
    "Registration error:",
    (error.response?.data as ApiErrorResponse)?.message || error.message
  );
});
