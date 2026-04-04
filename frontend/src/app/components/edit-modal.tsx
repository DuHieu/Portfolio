import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save } from 'lucide-react';
import { useEdit } from '../context/edit-context';

interface EditModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  type: 'profile' | 'project' | 'experience';
  id: string; // 'profile' or specific ID
  initialData: any;
}

export function EditModal({ isOpen, onClose, title, type, id, initialData }: EditModalProps) {
  const { updateDraft } = useEdit();
  const [formData, setFormData] = useState(initialData);

  useEffect(() => {
    setFormData(initialData);
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    updateDraft(`${type}:${id}`, formData);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />
        
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="relative w-full max-w-lg bg-[#1A1A1A] border border-white/10 rounded-3xl p-8 shadow-2xl overflow-hidden"
        >
          {/* Decorative glow */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#00D9FF]/10 blur-3xl rounded-full" />
          
          <div className="flex items-center justify-between mb-8 relative z-10">
            <h3 className="text-2xl font-bold text-white">{title}</h3>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/50 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-6 relative z-10">
            {Object.keys(initialData).map((key) => {
              if (key === 'id') return null;
              
              return (
                <div key={key}>
                  <label className="block text-sm font-medium text-white/50 mb-2 capitalize">
                    {key.replace('_', ' ')}
                  </label>
                  {key === 'description' || key === 'bio' ? (
                    <textarea
                      name={key}
                      value={formData[key] || ''}
                      onChange={handleChange}
                      rows={4}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#00D9FF]/50 transition-colors resize-none"
                    />
                  ) : (
                    <input
                      type="text"
                      name={key}
                      value={formData[key] || ''}
                      onChange={handleChange}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#00D9FF]/50 transition-colors"
                    />
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-10 flex gap-4 relative z-10">
            <button
              onClick={onClose}
              className="flex-1 py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-medium transition-colors border border-white/10"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex-1 py-4 bg-gradient-to-r from-[#00D9FF] to-[#A855F7] text-white rounded-2xl font-bold shadow-lg shadow-[#00D9FF]/20 flex items-center justify-center gap-2"
            >
              <Save className="w-5 h-5" />
              Save Draft
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
