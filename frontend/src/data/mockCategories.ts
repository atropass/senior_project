import { Users, Book, MessageCircle, Award, Heart } from "lucide-react";
import { LucideIcon } from "lucide-react";

export interface CategoryData {
  id: number;
  name: string;
  icon: LucideIcon;
  color: string;
  words: string[];
}

export const categoriesData: CategoryData[] = [
  {
    id: 1,
    name: "Family",
    icon: Users,
    color: "blue",
    words: [
      "Mother",
      "Father",
      "Sister",
      "Brother",
      "Grandparents",
      "Cousin",
      "Aunt",
      "Uncle",
    ],
  },
  {
    id: 2,
    name: "General",
    icon: Book,
    color: "green",
    words: [
      "School",
      "Learning",
      "Knowledge",
      "Education",
      "Student",
      "Teacher",
      "Classroom",
      "Lesson",
    ],
  },
  {
    id: 3,
    name: "Dialogues",
    icon: MessageCircle,
    color: "grape",
    words: [
      "Hello",
      "Goodbye",
      "Thank you",
      "Please",
      "Sorry",
      "Excuse me",
      "Welcome",
      "Congratulations",
    ],
  },
  {
    id: 4,
    name: "Achievements",
    icon: Award,
    color: "yellow",
    words: [
      "Success",
      "Victory",
      "Achievement",
      "Accomplish",
      "Excel",
      "Progress",
      "Improve",
      "Develop",
    ],
  },
  {
    id: 5,
    name: "Literature",
    icon: Book,
    color: "red",
    words: [
      "Novel",
      "Poetry",
      "Story",
      "Character",
      "Author",
      "Reader",
      "Chapter",
      "Fiction",
    ],
  },
  {
    id: 6,
    name: "Emotions",
    icon: Heart,
    color: "pink",
    words: [
      "Happy",
      "Sad",
      "Angry",
      "Excited",
      "Nervous",
      "Surprised",
      "Peaceful",
      "Confused",
    ],
  },
];
