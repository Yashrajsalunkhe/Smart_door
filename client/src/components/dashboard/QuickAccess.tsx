import React from 'react';
import { Link } from 'wouter';

interface QuickAccessCardProps {
  to: string;
  icon: string;
  title: string;
}

const QuickAccessCard: React.FC<QuickAccessCardProps> = ({ to, icon, title }) => {
  return (
    <Link href={to}>
      <a className="bg-white dark:bg-[#1E1E1E] rounded-lg shadow-sm p-5 border border-gray-200 dark:border-gray-700 hover:border-[#3B82F6] dark:hover:border-[#3B82F6] transition-colors duration-200 text-center">
        <div className="flex flex-col items-center">
          <span className="material-icons text-4xl text-[#3B82F6] mb-2">{icon}</span>
          <h4 className="font-medium text-gray-900 dark:text-white">{title}</h4>
        </div>
      </a>
    </Link>
  );
};

const QuickAccess = () => {
  return (
    <>
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Quick Access</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <QuickAccessCard 
          to="/recognition" 
          icon="face" 
          title="Face Recognition" 
        />
        <QuickAccessCard 
          to="/management" 
          icon="people" 
          title="Face Management" 
        />
        <QuickAccessCard 
          to="/history" 
          icon="history" 
          title="History" 
        />
        <QuickAccessCard 
          to="/settings" 
          icon="settings" 
          title="Settings" 
        />
      </div>
    </>
  );
};

export default QuickAccess;
