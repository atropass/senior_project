import { useGate } from "effector-react";
import { CategoriesGate } from "../../features/categories/get-categories";
import CategoriesList from "../../components/flashcards/CategoriesList";

const LearnPage = () => {
  useGate(CategoriesGate);

  return (
    <div>
      <CategoriesList />
    </div>
  );
};

export default LearnPage;
