import React from 'react';
import { useDoorbellContext } from '@/context/DoorbellContext';
import { Detection, HistoryFilters } from '@/types';
import { StatusBadge } from '@/components/ui/status-badge';
import { format } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from '@/components/ui/button';

interface HistoryGalleryProps {
  filters: HistoryFilters;
  onFilterChange: (newFilters: Partial<HistoryFilters>) => void;
}

const HistoryGallery: React.FC<HistoryGalleryProps> = ({ filters, onFilterChange }) => {
  const { detections } = useDoorbellContext();
  
  // Filter detections based on the current filters
  const filteredDetections = detections.filter(detection => {
    // Apply date filter
    const detectionDate = new Date(detection.timestamp);
    const now = new Date();
    
    let dateMatch = true;
    if (filters.dateRange === 'today') {
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      dateMatch = detectionDate >= today;
    } else if (filters.dateRange === 'week') {
      const weekAgo = new Date(now);
      weekAgo.setDate(now.getDate() - 7);
      dateMatch = detectionDate >= weekAgo;
    } else if (filters.dateRange === 'month') {
      const monthAgo = new Date(now);
      monthAgo.setDate(now.getDate() - 30);
      dateMatch = detectionDate >= monthAgo;
    }
    
    // Apply person filter
    let personMatch = true;
    if (filters.personFilter === 'known') {
      personMatch = detection.isKnown;
    } else if (filters.personFilter === 'unknown') {
      personMatch = !detection.isKnown;
    } else if (filters.personFilter !== 'all') {
      personMatch = detection.personId === filters.personFilter;
    }
    
    // Apply search term filter
    let searchMatch = true;
    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      const personName = detection.personName?.toLowerCase() || '';
      searchMatch = personName.includes(term);
    }
    
    return dateMatch && personMatch && searchMatch;
  });
  
  // Sort based on filter
  const sortedDetections = [...filteredDetections].sort((a, b) => {
    const dateA = new Date(a.timestamp).getTime();
    const dateB = new Date(b.timestamp).getTime();
    return filters.sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
  });

  if (sortedDetections.length === 0) {
    return (
      <div className="bg-white dark:bg-[#1E1E1E] rounded-lg shadow-sm overflow-hidden border border-gray-200 dark:border-gray-700">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Recent Captures</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">No results found</p>
          </div>
        </div>
        <div className="p-8 flex flex-col items-center justify-center">
          <span className="material-icons text-4xl text-gray-400 mb-2">search_off</span>
          <p className="text-gray-500 dark:text-gray-400 mb-1">No detections match your filters</p>
          <Button 
            variant="outline" 
            onClick={() => onFilterChange({
              dateRange: 'month',
              personFilter: 'all',
              searchTerm: '',
              sortOrder: 'newest'
            })}
            className="mt-4"
          >
            Reset Filters
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#1E1E1E] rounded-lg shadow-sm overflow-hidden border border-gray-200 dark:border-gray-700">
      <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Recent Captures</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">Showing {sortedDetections.length} results</p>
        </div>
        <div>
          <Select
            value={filters.sortOrder}
            onValueChange={(value) => onFilterChange({ sortOrder: value as 'newest' | 'oldest' })}
          >
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest first</SelectItem>
              <SelectItem value="oldest">Oldest first</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4">
        {sortedDetections.map((detection) => (
          <HistoryItem key={detection.id} detection={detection} />
        ))}
      </div>
      
      {/* Simple pagination */}
      {sortedDetections.length > 0 && (
        <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Showing <span className="font-medium">1</span> to <span className="font-medium">{sortedDetections.length}</span> of <span className="font-medium">{detections.length}</span> results
              </p>
            </div>
            {/* In a real app, this would be a functional pagination component */}
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <a href="#" className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600">
                  <span className="material-icons text-sm">chevron_left</span>
                </a>
                <a href="#" className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 bg-blue-50 dark:bg-blue-900 text-sm font-medium text-blue-600 dark:text-blue-200 hover:bg-gray-50 dark:hover:bg-gray-600">
                  1
                </a>
                <a href="#" className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600">
                  <span className="material-icons text-sm">chevron_right</span>
                </a>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

interface HistoryItemProps {
  detection: Detection;
}

const HistoryItem: React.FC<HistoryItemProps> = ({ detection }) => {
  const date = new Date(detection.timestamp);
  const formattedDate = format(date, 'PPpp'); // Formats as "Jan 1, 2022, 12:00 PM"
  const shortDate = format(date, 'PPp'); // Formats as "Jan 1, 2022, 12:00 PM"

  return (
    <div className="group relative rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
      {detection.imageUrl ? (
        <img 
          src={detection.imageUrl} 
          alt="History capture" 
          className="w-full h-40 object-cover"
        />
      ) : (
        <div className="w-full h-40 flex items-center justify-center bg-gray-200 dark:bg-gray-700">
          <span className="material-icons text-gray-400 text-4xl">broken_image</span>
        </div>
      )}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-3">
        <div className="text-white">
          <p className="font-medium text-sm">{detection.personName || 'Unknown Person'}</p>
          <p className="text-xs opacity-80" title={formattedDate}>{shortDate}</p>
        </div>
      </div>
      <div className="absolute top-2 right-2">
        <StatusBadge 
          status={detection.isKnown ? 'known' : 'unknown'} 
          className="text-xs"
        />
      </div>
    </div>
  );
};

export default HistoryGallery;
