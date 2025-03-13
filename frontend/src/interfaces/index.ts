export interface User {
  user_id: number;
  username: string;
  email: string;
  created_at: string;
}

export interface UserCredentials {
  username: string;
  password: string;
}

export interface RegisterUserData extends UserCredentials {
  email: string;
}

export interface LoginResponse {
  access_token: string;
}

export interface Category {
  category_id: number;
  name: string;
  flashcards: number[];
}

export interface Flashcard {
  word_id: number;
  word: string;
  categories: string[];
  picture: string;
  eng_translation: string;
  rus_translation: string;
  phonetic: string;
  audio: string;
}

export interface CreateFlashcardData {
  word: string;
  eng_translation: string;
  rus_translation: string;
  phonetic: string;
  picture?: string;
  audio?: string;
  categories?: number[];
}

export interface UpdateFlashcardData {
  word?: string;
  eng_translation?: string;
  rus_translation?: string;
  phonetic?: string;
  picture?: string;
  audio?: string;
}

export interface FlashcardsResponse {
  count: number;
  flashcards: Flashcard[];
}

export interface SingleFlashcardResponse {
  flashcard: Flashcard;
}

export interface CategoriesResponse {
  count: number;
  categories: Category[];
}

export interface SpeechAnalysisResult {
  confidence: number;
  transcript: string;
  is_correct: boolean;
  feedback?: string;
}
