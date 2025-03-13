import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";
import { MantineProvider } from "@mantine/core";
import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";

import MainLayout from "./components/layout/MainLayout";
import LoginPage from "./pages/auth/login/LoginPage";
import RegisterPage from "./pages/auth/register/RegisterPage";
import LearnPage from "./pages/learn/LearnPage";
import FlashcardPage from "./pages/flashcard";
import { Notifications } from "@mantine/notifications";

function PrivateLayout() {
  const isAuthenticated = Boolean(localStorage.getItem("token"));

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <MainLayout>
      <Outlet />
    </MainLayout>
  );
}

function App() {
  return (
    <MantineProvider
      theme={{
        fontFamily: "Raleway, sans-serif",
      }}
    >
      <Notifications />
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route element={<PrivateLayout />}>
            <Route path="/learn" element={<LearnPage />} />
            <Route path="/flashcards/:word" element={<FlashcardPage />} />
          </Route>

          <Route path="/" element={<Navigate to="/learn" replace />} />
          <Route path="*" element={<Navigate to="/learn" replace />} />
        </Routes>
      </Router>
    </MantineProvider>
  );
}

export default App;
