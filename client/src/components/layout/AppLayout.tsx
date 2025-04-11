import { useState, useEffect, ReactNode } from "react";
import Sidebar from "./Sidebar";
import MobileNav from "./MobileNav";
import { useLocation } from "wouter";

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const [location] = useLocation();
  const [currentPage, setCurrentPage] = useState<string>("dashboard");

  useEffect(() => {
    const path = location === "/" ? "dashboard" : location.substring(1);
    setCurrentPage(path);
  }, [location]);

  return (
    <div className="flex flex-col md:flex-row h-screen">
      {/* Sidebar for desktop */}
      <Sidebar currentPage={currentPage} />
      
      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto no-scrollbar">
        {children}
      </main>
      
      {/* Mobile Navigation */}
      <MobileNav currentPage={currentPage} />
    </div>
  );
}
