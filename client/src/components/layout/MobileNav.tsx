import React from 'react';
import { Link, useLocation } from 'wouter';

const MobileNav = () => {
  const [location] = useLocation();

  const isActive = (path: string) => location === path;

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-[#1E1E1E] border-t border-gray-200 dark:border-gray-700 px-4 py-2 z-50">
      <div className="flex justify-around">
        <Link href="/">
          <div className={`flex flex-col items-center cursor-pointer ${isActive('/') ? 'text-[#3B82F6]' : 'text-gray-500 dark:text-gray-400'}`}>
            <span className="material-icons text-lg">dashboard</span>
            <span className="text-xs">Home</span>
          </div>
        </Link>
        <Link href="/recognition">
          <div className={`flex flex-col items-center cursor-pointer ${isActive('/recognition') ? 'text-[#3B82F6]' : 'text-gray-500 dark:text-gray-400'}`}>
            <span className="material-icons text-lg">face</span>
            <span className="text-xs">Recognition</span>
          </div>
        </Link>
        <Link href="/management">
          <div className={`flex flex-col items-center cursor-pointer ${isActive('/management') ? 'text-[#3B82F6]' : 'text-gray-500 dark:text-gray-400'}`}>
            <span className="material-icons text-lg">people</span>
            <span className="text-xs">Manage</span>
          </div>
        </Link>
        <Link href="/history">
          <div className={`flex flex-col items-center cursor-pointer ${isActive('/history') ? 'text-[#3B82F6]' : 'text-gray-500 dark:text-gray-400'}`}>
            <span className="material-icons text-lg">history</span>
            <span className="text-xs">History</span>
          </div>
        </Link>
        <Link href="/settings">
          <div className={`flex flex-col items-center cursor-pointer ${isActive('/settings') ? 'text-[#3B82F6]' : 'text-gray-500 dark:text-gray-400'}`}>
            <span className="material-icons text-lg">settings</span>
            <span className="text-xs">Settings</span>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default MobileNav;
