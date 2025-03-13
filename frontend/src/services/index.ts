import axios, { AxiosResponse } from "axios";
import {
  User,
  UserCredentials,
  RegisterUserData,
  LoginResponse,
  CreateFlashcardData,
  UpdateFlashcardData,
  FlashcardsResponse,
  CategoriesResponse,
  SingleFlashcardResponse,
} from "../interfaces";
import { PronunciationResult } from "../interfaces/analysis";

const api = axios.create({
  baseURL: "http://127.0.0.1:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const authService = {
  register: (
    userData: RegisterUserData
  ): Promise<AxiosResponse<{ message: string }>> => {
    return api.post("/auth/register", userData);
  },
  login: (
    credentials: UserCredentials
  ): Promise<AxiosResponse<LoginResponse>> => {
    return api.post("/auth/login", credentials);
  },
  getProfile: (): Promise<AxiosResponse<User>> => {
    return api.get("/auth/profile");
  },
};

export const flashcardService = {
  getAllFlashcards: (): Promise<AxiosResponse<FlashcardsResponse>> => {
    return api.get("/flashcards/");
  },
  getFlashcardById: (
    id: number
  ): Promise<AxiosResponse<SingleFlashcardResponse>> => {
    return api.get(`/flashcards/${id}`);
  },
  getFlashcardByWord: (
    word: string
  ): Promise<AxiosResponse<SingleFlashcardResponse>> => {
    return api.get(`/flashcards/${word}`);
  },
  createFlashcard: (
    flashcardData: CreateFlashcardData
  ): Promise<AxiosResponse<{ message: string }>> => {
    return api.post("/flashcards/", flashcardData);
  },
  updateFlashcard: (
    id: number,
    flashcardData: UpdateFlashcardData
  ): Promise<AxiosResponse<{ message: string }>> => {
    return api.put(`/flashcards/${id}`, flashcardData);
  },
  deleteFlashcard: (
    id: number
  ): Promise<AxiosResponse<{ message: string }>> => {
    return api.delete(`/flashcards/${id}`);
  },
  getFlashcardsByCategory: (
    categoryId: number
  ): Promise<AxiosResponse<FlashcardsResponse>> => {
    return api.get(`/flashcards/categories/${categoryId}`);
  },
};

export const categoryService = {
  getAllCategories: (): Promise<AxiosResponse<CategoriesResponse>> => {
    return api.get("/categories/");
  },
  getFlashcardsByCategory: (
    categoryId: number
  ): Promise<AxiosResponse<FlashcardsResponse>> => {
    return api.get(`/categories/${categoryId}/flashcards`);
  },
};

export const speechService = {
  analyzeSpeech: (
    audioFile: File,
    wordIndex: number
  ): Promise<AxiosResponse<PronunciationResult>> => {
    const formData = new FormData();
    formData.append("audio", audioFile);
    formData.append("word_index", wordIndex.toString());

    return api.post("/speech/analyze", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
};

export default api;
