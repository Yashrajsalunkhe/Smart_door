import React, { useState } from 'react';
import { useDoorbellContext } from '@/context/DoorbellContext';
import HistoryFilters from '@/components/history/HistoryFilters';
import HistoryGallery from '@/components/history/HistoryGallery';
import { HistoryFilters as Filters } from '@/types';

const History = () => {
  const { isLoading } = useDoorbellContext();
  const [filters, setFilters] = useState<Filters>({
    dateRange: 'month',
    personFilter: 'all',
    searchTerm: '',
    sortOrder: 'newest'
  });

  const handleFilterChange = (newFilters: Partial<Filters>) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters
    }));
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3B82F6]"></div>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">History</h2>
          <p className="text-gray-600 dark:text-gray-400">Browse past doorbell captures</p>
        </div>
      </div>
      
      {/* Filters */}
      <HistoryFilters 
        filters={filters}
        onFilterChange={handleFilterChange}
      />
      
      {/* History gallery */}
      <HistoryGallery 
        filters={filters}
        onFilterChange={handleFilterChange}
      />
    </div>
  );
};

export default History;
