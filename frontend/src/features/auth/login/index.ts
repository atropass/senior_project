import { createStore, createEffect, createEvent, sample } from "effector";
import { AxiosError } from "axios";
import { LoginResponse, UserCredentials } from "../../../interfaces";
import { authService } from "../../../services";
import { ApiErrorResponse } from "../../../services/interfaces";

export const loginFx = createEffect<UserCredentials, LoginResponse, AxiosError>(
  async (credentials) => {
    const response = await authService.login(credentials);
    return response.data;
  }
);

export const loginFormSubmitted = createEvent<UserCredentials>();
export const resetLoginState = createEvent();
export const navigateToDashboard = createEvent();

export const $loginPending = loginFx.pending;
export const $loginSuccess = createStore(false)
  .on(loginFx.done, () => true)
  .on(loginFx.fail, () => false)
  .reset(resetLoginState);

export const $loginError = createStore<string | null>(null)
  .on(
    loginFx.failData,
    (_, error) =>
      (error.response?.data as ApiErrorResponse)?.message || "Login failed"
  )
  .reset(resetLoginState);

export const $loginData = createStore<LoginResponse | null>(null)
  .on(loginFx.doneData, (_, data) => data)
  .reset(resetLoginState);

// Connect login form submission to API effect
sample({
  clock: loginFormSubmitted,
  target: loginFx,
});

// Navigate to dashboard on successful login
sample({
  clock: loginFx.done,
  target: navigateToDashboard,
});

// Store token on successful login
$loginData.watch((data) => {
  if (data?.access_token) {
    localStorage.setItem("token", data.access_token);
  }
});

// Error logging
loginFx.fail.watch(({ error }) => {
  console.error(
    "Login error:",
    (error.response?.data as ApiErrorResponse)?.message || error.message
  );
});
