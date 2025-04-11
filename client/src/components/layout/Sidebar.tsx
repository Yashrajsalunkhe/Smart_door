import React from 'react';
import { Link, useLocation } from 'wouter';
import { useTheme } from '@/hooks/use-theme';

const Sidebar = () => {
  const [location] = useLocation();
  const { isDarkMode, toggleDarkMode } = useTheme();

  const isActive = (path: string) => location === path;

  return (
    <div className="hidden md:flex flex-col w-64 bg-white dark:bg-[#1E1E1E] border-r border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-center h-16 border-b border-gray-200 dark:border-gray-700">
        <h1 className="text-xl font-semibold text-[#3B82F6] dark:text-blue-400">Smart Doorbell</h1>
      </div>
      
      <nav className="flex-1 overflow-y-auto pt-5 pb-4">
        <ul>
          <li>
            <div className={`${
              isActive('/') 
                ? 'text-gray-900 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 border-l-4 border-[#3B82F6]' 
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200'
            }`}>
              <Link href="/">
                <div className="flex items-center px-6 py-3 cursor-pointer">
                  <span className="material-icons mr-3">dashboard</span>
                  <span>Dashboard</span>
                </div>
              </Link>
            </div>
          </li>
          <li>
            <div className={`${
              isActive('/recognition') 
                ? 'text-gray-900 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 border-l-4 border-[#3B82F6]' 
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200'
            }`}>
              <Link href="/recognition">
                <div className="flex items-center px-6 py-3 cursor-pointer">
                  <span className="material-icons mr-3">face</span>
                  <span>Face Recognition</span>
                </div>
              </Link>
            </div>
          </li>
          <li>
            <div className={`${
              isActive('/management') 
                ? 'text-gray-900 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 border-l-4 border-[#3B82F6]' 
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200'
            }`}>
              <Link href="/management">
                <div className="flex items-center px-6 py-3 cursor-pointer">
                  <span className="material-icons mr-3">people</span>
                  <span>Face Management</span>
                </div>
              </Link>
            </div>
          </li>
          <li>
            <div className={`${
              isActive('/history') 
                ? 'text-gray-900 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 border-l-4 border-[#3B82F6]' 
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200'
            }`}>
              <Link href="/history">
                <div className="flex items-center px-6 py-3 cursor-pointer">
                  <span className="material-icons mr-3">history</span>
                  <span>History</span>
                </div>
              </Link>
            </div>
          </li>
          <li>
            <div className={`${
              isActive('/settings') 
                ? 'text-gray-900 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 border-l-4 border-[#3B82F6]' 
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200'
            }`}>
              <Link href="/settings">
                <div className="flex items-center px-6 py-3 cursor-pointer">
                  <span className="material-icons mr-3">settings</span>
                  <span>Settings</span>
                </div>
              </Link>
            </div>
          </li>
        </ul>
      </nav>
      
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <button 
          className="flex items-center justify-center w-full px-4 py-2 text-sm bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded"
          onClick={toggleDarkMode}
        >
          <span className="material-icons mr-2 text-sm">
            {isDarkMode ? 'light_mode' : 'dark_mode'}
          </span>
          <span>Toggle Dark Mode</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
