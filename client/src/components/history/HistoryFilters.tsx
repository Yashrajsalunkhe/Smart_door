import React, { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useDoorbellContext } from '@/context/DoorbellContext';
import { HistoryFilters as Filters } from '@/types';

interface HistoryFiltersProps {
  filters: Filters;
  onFilterChange: (newFilters: Partial<Filters>) => void;
}

const HistoryFilters: React.FC<HistoryFiltersProps> = ({ filters, onFilterChange }) => {
  const { people } = useDoorbellContext();
  
  return (
    <div className="bg-white dark:bg-[#1E1E1E] rounded-lg shadow-sm p-5 border border-gray-200 dark:border-gray-700 mb-6">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <label htmlFor="date-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date Range</label>
          <Select
            value={filters.dateRange}
            onValueChange={(value) => onFilterChange({ dateRange: value as Filters['dateRange'] })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select date range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">Last 7 days</SelectItem>
              <SelectItem value="month">Last 30 days</SelectItem>
              <SelectItem value="custom">Custom range</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1">
          <label htmlFor="person-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Person</label>
          <Select
            value={filters.personFilter}
            onValueChange={(value) => onFilterChange({ personFilter: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select person" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All people</SelectItem>
              <SelectItem value="known">Known only</SelectItem>
              <SelectItem value="unknown">Unknown only</SelectItem>
              {people.map((person) => (
                <SelectItem key={person.id} value={person.id}>{person.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1">
          <label htmlFor="search" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Search</label>
          <Input
            id="search"
            value={filters.searchTerm}
            onChange={(e) => onFilterChange({ searchTerm: e.target.value })}
            placeholder="Search history..."
          />
        </div>
      </div>
    </div>
  );
};

export default HistoryFilters;
