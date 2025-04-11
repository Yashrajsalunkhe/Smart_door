import React, { useState } from 'react';
import { useDoorbellContext } from '@/context/DoorbellContext';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

interface EditDialogProps {
  personId: string;
  personName: string;
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, name: string) => void;
}

const EditDialog: React.FC<EditDialogProps> = ({ personId, personName, isOpen, onClose, onSave }) => {
  const [name, setName] = useState(personName);

  const handleSave = () => {
    if (name.trim()) {
      onSave(personId, name);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Person</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Name
          </label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter person's name"
            className="w-full"
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} className="bg-[#3B82F6]">Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

interface DeleteDialogProps {
  personId: string;
  personName: string;
  isOpen: boolean;
  onClose: () => void;
  onDelete: (id: string) => void;
}

const DeleteDialog: React.FC<DeleteDialogProps> = ({ personId, personName, isOpen, onClose, onDelete }) => {
  const handleDelete = () => {
    onDelete(personId);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Person</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Are you sure you want to delete <span className="font-medium">{personName}</span>? This action cannot be undone.
          </p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button variant="destructive" onClick={handleDelete}>Delete</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const FaceList = () => {
  const { people, updatePerson, deletePerson } = useDoorbellContext();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState<{ id: string; name: string } | null>(null);
  const { toast } = useToast();

  const handleEdit = (id: string, name: string) => {
    setSelectedPerson({ id, name });
    setEditDialogOpen(true);
  };

  const handleDelete = (id: string, name: string) => {
    setSelectedPerson({ id, name });
    setDeleteDialogOpen(true);
  };

  const handleSaveEdit = async (id: string, name: string) => {
    try {
      await updatePerson(id, { name });
      toast({
        title: "Person updated",
        description: `${name} has been updated successfully.`,
      });
    } catch (error) {
      toast({
        title: "Update failed",
        description: "There was an error updating the person.",
        variant: "destructive",
      });
    }
  };

  const handleConfirmDelete = async (id: string) => {
    try {
      await deletePerson(id);
      toast({
        title: "Person deleted",
        description: "The person has been removed from the system.",
      });
    } catch (error) {
      toast({
        title: "Delete failed",
        description: "There was an error deleting the person.",
        variant: "destructive",
      });
    }
  };

  if (people.length === 0) {
    return (
      <div className="bg-white dark:bg-[#1E1E1E] rounded-lg shadow-sm overflow-hidden border border-gray-200 dark:border-gray-700 mb-6">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Registered Faces</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">No faces registered yet</p>
        </div>
        <div className="flex items-center justify-center py-8">
          <p className="text-gray-500 dark:text-gray-400">Add your first face using the "Add New Face" button</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#1E1E1E] rounded-lg shadow-sm overflow-hidden border border-gray-200 dark:border-gray-700 mb-6">
      <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Registered Faces</h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
          Currently managing {people.length} trusted {people.length === 1 ? 'face' : 'faces'}
        </p>
      </div>
      <ul className="divide-y divide-gray-200 dark:divide-gray-700">
        {people.map((person) => (
          <li 
            key={person.id} 
            className="px-4 py-4 sm:px-6 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-150"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="h-12 w-12 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
                  {person.images && person.images.length > 0 ? (
                    <img 
                      src={person.images[0]} 
                      alt={person.name} 
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center">
                      <span className="material-icons text-gray-400">person</span>
                    </div>
                  )}
                </div>
                <div className="ml-4">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">{person.name}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Added {formatDistanceToNow(new Date(person.createdAt), { addSuffix: true })}
                  </div>
                </div>
              </div>
              <div className="flex space-x-2">
                <button 
                  className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                  onClick={() => handleEdit(person.id, person.name)}
                >
                  <span className="material-icons text-sm">edit</span>
                </button>
                <button 
                  className="text-red-400 hover:text-red-500 dark:hover:text-red-300"
                  onClick={() => handleDelete(person.id, person.name)}
                >
                  <span className="material-icons text-sm">delete</span>
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>

      {/* Edit Dialog */}
      {selectedPerson && (
        <EditDialog 
          personId={selectedPerson.id}
          personName={selectedPerson.name}
          isOpen={editDialogOpen}
          onClose={() => setEditDialogOpen(false)}
          onSave={handleSaveEdit}
        />
      )}

      {/* Delete Dialog */}
      {selectedPerson && (
        <DeleteDialog
          personId={selectedPerson.id}
          personName={selectedPerson.name}
          isOpen={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
          onDelete={handleConfirmDelete}
        />
      )}
    </div>
  );
};

export default FaceList;
