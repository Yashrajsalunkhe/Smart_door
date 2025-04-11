import { Link } from "wouter";
import { Home, Camera, Users, Clock, Settings } from "lucide-react";

interface SidebarProps {
  currentPage: string;
}

export default function Sidebar({ currentPage }: SidebarProps) {
  return (
    <aside className="hidden md:flex flex-col w-64 bg-white dark:bg-gray-800 shadow-lg">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h1 className="text-lg font-semibold flex items-center">
          <Home className="h-6 w-6 mr-2 text-primary" />
          Smart Doorbell
        </h1>
      </div>
      
      <nav className="flex-1 px-2 py-4 space-y-1">
        <Link href="/">
          <div className={`flex items-center px-4 py-2 rounded-md font-medium transition duration-150 cursor-pointer ${
            currentPage === "dashboard" 
              ? "text-primary-foreground bg-primary"
              : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          }`}>
            <Home className="h-5 w-5 mr-3" />
            Dashboard
          </div>
        </Link>
        <Link href="/face-recognition">
          <div className={`flex items-center px-4 py-2 rounded-md font-medium transition duration-150 cursor-pointer ${
            currentPage === "face-recognition" 
              ? "text-primary-foreground bg-primary"
              : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          }`}>
            <Camera className="h-5 w-5 mr-3" />
            Face Recognition
          </div>
        </Link>
        <Link href="/face-management">
          <div className={`flex items-center px-4 py-2 rounded-md font-medium transition duration-150 cursor-pointer ${
            currentPage === "face-management" 
              ? "text-primary-foreground bg-primary"
              : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          }`}>
            <Users className="h-5 w-5 mr-3" />
            Face Management
          </div>
        </Link>
        <Link href="/history">
          <div className={`flex items-center px-4 py-2 rounded-md font-medium transition duration-150 cursor-pointer ${
            currentPage === "history" 
              ? "text-primary-foreground bg-primary"
              : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          }`}>
            <Clock className="h-5 w-5 mr-3" />
            History
          </div>
        </Link>
        <Link href="/settings">
          <div className={`flex items-center px-4 py-2 rounded-md font-medium transition duration-150 cursor-pointer ${
            currentPage === "settings" 
              ? "text-primary-foreground bg-primary"
              : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          }`}>
            <Settings className="h-5 w-5 mr-3" />
            Settings
          </div>
        </Link>
      </nav>
      
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center">
          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
            <Users className="h-6 w-6" />
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium">Admin User</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Administrator</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
