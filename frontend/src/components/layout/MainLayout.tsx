import React, { useState } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import { Menu, X } from "lucide-react";

interface MainLayoutProps {
  children: React.ReactNode;
  title?: string;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children, title = "" }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-gray-800 bg-opacity-50 z-20 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      <div
        className={`
        fixed inset-y-0 left-0 z-30 w-64 transform transition-transform duration-300 ease-in-out 
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} 
        lg:translate-x-0 lg:static lg:z-10
      `}
      >
        <Sidebar />
      </div>

      <div className="flex flex-col flex-1 w-full ">
        <div className="sticky top-0 z-10">
          <Header />

          <button
            className="absolute top-4 left-4 lg:hidden text-gray-600 focus:outline-none"
            onClick={toggleSidebar}
            aria-label="Toggle menu"
          >
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        <main className="flex-1 overflow-y-auto">
          <div className="p-4 md:p-6 lg:p-8 min-h-[calc(100vh-4rem)]">
            {title && (
              <h1 className="text-xl md:text-2xl font-semibold mb-4 md:mb-6">
                {title}
              </h1>
            )}
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
