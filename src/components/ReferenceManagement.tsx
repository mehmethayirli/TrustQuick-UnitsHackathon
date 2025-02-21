import React, { useState } from 'react';
import { Plus, Trash2, CheckCircle, Clock, ExternalLink, Link2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

type Reference = {
  id: string;
  name: string;
  relationship: string;
  contact: string;
  status: 'verified' | 'under_review';
  createdAt: Date;
};

const relationshipTypes = [
  'Co-worker',
  'Manager',
  'Client',
  'Business Partner',
  'Academic Advisor',
  'Mentor',
];

export function ReferenceManagement() {
  const [references, setReferences] = useState<Reference[]>([
    {
      id: '1',
      name: 'John Smith',
      relationship: 'Co-worker',
      contact: 'john.smith@example.com',
      status: 'verified',
      createdAt: new Date('2024-01-15'),
    },
    {
      id: '2',
      name: 'Sarah Johnson',
      relationship: 'Manager',
      contact: 'sarah.j@example.com',
      status: 'under_review',
      createdAt: new Date('2024-02-01'),
    },
  ]);

  const [isAddingReference, setIsAddingReference] = useState(false);
  const [selectedReference, setSelectedReference] = useState<Reference | null>(null);
  const [newReference, setNewReference] = useState({
    name: '',
    relationship: '',
    contact: '',
  });

  const handleAddReference = (e: React.FormEvent) => {
    e.preventDefault();
    const reference: Reference = {
      id: Date.now().toString(),
      ...newReference,
      status: 'under_review',
      createdAt: new Date(),
    };

    const addToast = toast.loading('Adding reference...');
    
    // Simulate API call
    setTimeout(() => {
      setReferences((prev) => [reference, ...prev]);
      setNewReference({ name: '', relationship: '', contact: '' });
      setIsAddingReference(false);
      toast.success('Reference added successfully!', { id: addToast });
    }, 1500);
  };

  const handleDeleteReference = (id: string) => {
    const deleteToast = toast.loading('Deleting reference...');
    
    // Simulate API call
    setTimeout(() => {
      setReferences(references.filter((ref) => ref.id !== id));
      toast.success('Reference deleted', { id: deleteToast });
    }, 1000);
  };

  return (
    <div className="bg-sidebar rounded-xl p-6 mb-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">References</h2>
        <motion.button
          onClick={() => setIsAddingReference(true)}
          className="flex items-center space-x-2 bg-primary/10 hover:bg-primary/20 text-primary px-4 py-2 rounded-lg transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Plus size={16} />
          <span>Add Reference</span>
        </motion.button>
      </div>

      <AnimatePresence>
        {isAddingReference && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-6 bg-background p-4 rounded-lg"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">New Reference</h3>
              <button
                onClick={() => setIsAddingReference(false)}
                className="text-gray-400 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddReference} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  type="text"
                  value={newReference.name}
                  onChange={(e) => setNewReference({ ...newReference, name: e.target.value })}
                  className="w-full bg-sidebar border border-primary/20 rounded-lg px-3 py-2 focus:outline-none focus:border-primary"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Relationship Type</label>
                <select
                  value={newReference.relationship}
                  onChange={(e) => setNewReference({ ...newReference, relationship: e.target.value })}
                  className="w-full bg-sidebar border border-primary/20 rounded-lg px-3 py-2 focus:outline-none focus:border-primary"
                  required
                >
                  <option value="">Select relationship type</option>
                  {relationshipTypes.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Contact</label>
                <input
                  type="email"
                  value={newReference.contact}
                  onChange={(e) => setNewReference({ ...newReference, contact: e.target.value })}
                  className="w-full bg-sidebar border border-primary/20 rounded-lg px-3 py-2 focus:outline-none focus:border-primary"
                  required
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAddingReference(false)}
                  className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <motion.button
                  type="submit"
                  className="bg-primary/10 hover:bg-primary/20 text-primary px-4 py-2 rounded-lg transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Add Reference
                </motion.button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-4">
        <AnimatePresence>
          {references.map((reference) => (
            <motion.div
              key={reference.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="bg-background p-4 rounded-lg flex items-center justify-between group"
              layoutId={reference.id}
            >
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <h3 className="font-medium">{reference.name}</h3>
                  {reference.status === 'verified' ? (
                    <motion.div
                      animate={{
                        scale: [1, 1.2, 1],
                        opacity: [1, 0.8, 1],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        repeatType: "reverse",
                      }}
                    >
                      <Link2 size={16} className="text-primary" />
                    </motion.div>
                  ) : (
                    <Clock size={16} className="text-yellow-500" />
                  )}
                  <span className={`text-sm ${
                    reference.status === 'verified' ? 'text-primary' : 'text-yellow-500'
                  }`}>
                    {reference.status === 'verified' ? 'Verified' : 'Under Review'}
                  </span>
                </div>
                <p className="text-sm text-gray-400">{reference.relationship}</p>
                <p className="text-sm text-gray-400">{reference.contact}</p>
              </div>
              <div className="flex items-center space-x-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <motion.button
                  onClick={() => setSelectedReference(reference)}
                  className="text-primary hover:text-primary/80 transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <ExternalLink size={16} />
                </motion.button>
                <motion.button
                  onClick={() => handleDeleteReference(reference.id)}
                  className="text-red-500 hover:text-red-400 transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Trash2 size={16} />
                </motion.button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {selectedReference && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedReference(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-sidebar rounded-xl p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold">Reference Details</h3>
                <button
                  onClick={() => setSelectedReference(null)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-400">Name</label>
                  <p className="font-medium">{selectedReference.name}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Relationship Type</label>
                  <p className="font-medium">{selectedReference.relationship}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Contact</label>
                  <p className="font-medium">{selectedReference.contact}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Status</label>
                  <div className="flex items-center space-x-2">
                    {selectedReference.status === 'verified' ? (
                      <CheckCircle size={16} className="text-primary" />
                    ) : (
                      <Clock size={16} className="text-yellow-500" />
                    )}
                    <span className={selectedReference.status === 'verified' ? 'text-primary' : 'text-yellow-500'}>
                      {selectedReference.status === 'verified' ? 'Verified' : 'Under Review'}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Added Date</label>
                  <p className="font-medium">
                    {selectedReference.createdAt.toLocaleDateString('en-US')}
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}