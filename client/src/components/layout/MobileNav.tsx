import { Link } from "wouter";
import { Home, Camera, Users, Clock, Settings } from "lucide-react";

interface MobileNavProps {
  currentPage: string;
}

export default function MobileNav({ currentPage }: MobileNavProps) {
  return (
    <nav className="md:hidden flex items-center justify-around bg-white dark:bg-gray-800 py-2 border-t border-gray-200 dark:border-gray-700">
      <Link href="/">
        <a className={`flex flex-col items-center p-2 ${
          currentPage === "dashboard" 
            ? "text-primary" 
            : "text-gray-500 dark:text-gray-400"
        }`}>
          <Home className="h-6 w-6" />
          <span className="text-xs mt-1">Home</span>
        </a>
      </Link>
      <Link href="/face-recognition">
        <a className={`flex flex-col items-center p-2 ${
          currentPage === "face-recognition" 
            ? "text-primary" 
            : "text-gray-500 dark:text-gray-400"
        }`}>
          <Camera className="h-6 w-6" />
          <span className="text-xs mt-1">Camera</span>
        </a>
      </Link>
      <Link href="/face-management">
        <a className={`flex flex-col items-center p-2 ${
          currentPage === "face-management" 
            ? "text-primary" 
            : "text-gray-500 dark:text-gray-400"
        }`}>
          <Users className="h-6 w-6" />
          <span className="text-xs mt-1">Faces</span>
        </a>
      </Link>
      <Link href="/history">
        <a className={`flex flex-col items-center p-2 ${
          currentPage === "history" 
            ? "text-primary" 
            : "text-gray-500 dark:text-gray-400"
        }`}>
          <Clock className="h-6 w-6" />
          <span className="text-xs mt-1">History</span>
        </a>
      </Link>
      <Link href="/settings">
        <a className={`flex flex-col items-center p-2 ${
          currentPage === "settings" 
            ? "text-primary" 
            : "text-gray-500 dark:text-gray-400"
        }`}>
          <Settings className="h-6 w-6" />
          <span className="text-xs mt-1">Settings</span>
        </a>
      </Link>
    </nav>
  );
}
