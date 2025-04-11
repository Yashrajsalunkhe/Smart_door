import React, { useState } from 'react';
import { useDoorbellContext } from '@/context/DoorbellContext';
import FaceList from '@/components/management/FaceList';
import AddFaceModal from '@/components/management/AddFaceModal';
import { Button } from '@/components/ui/button';

const FaceManagement = () => {
  const { isLoading } = useDoorbellContext();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

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
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Face Management</h2>
          <p className="text-gray-600 dark:text-gray-400">Add and manage trusted faces</p>
        </div>
        <div className="mt-4 md:mt-0">
          <Button 
            onClick={() => setIsAddModalOpen(true)}
            className="bg-[#3B82F6] hover:bg-blue-600"
          >
            <span className="material-icons text-sm mr-1">add</span>
            Add New Face
          </Button>
        </div>
      </div>
      
      {/* Face List */}
      <FaceList />
      
      {/* Add Face Modal */}
      <AddFaceModal 
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </div>
  );
};

export default FaceManagement;
