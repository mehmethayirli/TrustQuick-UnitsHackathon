import React, { useState } from 'react';
import { Shield, ExternalLink, Lock, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

type PrivacyControl = {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
  icon: React.ReactNode;
};

export function PrivacyControls() {
  const [controls, setControls] = useState<PrivacyControl[]>([
    {
      id: 'social',
      label: 'Social Media Data',
      description: 'Share data from connected social media accounts',
      enabled: true,
      icon: <motion.div whileHover={{ scale: 1.1 }} className="text-primary"><Lock size={16} /></motion.div>,
    },
    {
      id: 'financial',
      label: 'Financial History',
      description: 'Share credit history and financial records',
      enabled: false,
      icon: <motion.div whileHover={{ scale: 1.1 }} className="text-primary"><Lock size={16} /></motion.div>,
    },
    {
      id: 'professional',
      label: 'Professional Background',
      description: 'Share work history and professional achievements',
      enabled: true,
      icon: <motion.div whileHover={{ scale: 1.1 }} className="text-primary"><Lock size={16} /></motion.div>,
    },
    {
      id: 'references',
      label: 'Reference Information',
      description: 'Share reference contact details and feedback',
      enabled: true,
      icon: <motion.div whileHover={{ scale: 1.1 }} className="text-primary"><Lock size={16} /></motion.div>,
    },
  ]);

  const [hoveredInfo, setHoveredInfo] = useState<string | null>(null);

  const handleToggle = (id: string) => {
    setControls(controls.map(control => {
      if (control.id === id) {
        return { ...control, enabled: !control.enabled };
      }
      return control;
    }));
    toast.success('Privacy settings updated', {
      icon: '🔒',
      style: {
        borderRadius: '10px',
        background: '#333',
        color: '#fff',
      },
    });
  };

  return (
    <div className="bg-sidebar rounded-xl p-6 mb-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Privacy & Security</h2>
        <Shield size={24} className="text-primary" />
      </div>

      <div className="space-y-6 mb-8">
        {controls.map((control) => (
          <motion.div
            key={control.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between bg-background p-4 rounded-lg group"
          >
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                {control.icon}
                <h3 className="font-medium">{control.label}</h3>
                <div
                  className="relative"
                  onMouseEnter={() => setHoveredInfo(control.id)}
                  onMouseLeave={() => setHoveredInfo(null)}
                >
                  <Info size={14} className="text-gray-400 cursor-help" />
                  <AnimatePresence>
                    {hoveredInfo === control.id && (
                      <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 5 }}
                        className="absolute left-0 bottom-full mb-2 w-48 p-2 bg-black rounded-lg text-sm z-10"
                      >
                        {control.description}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={control.enabled}
                onChange={() => handleToggle(control.id)}
                className="sr-only peer"
              />
              <motion.div
                className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              />
            </label>
          </motion.div>
        ))}
      </div>

      <div className="bg-background rounded-lg p-4">
        <div className="flex items-start space-x-3 mb-4">
          <Shield size={20} className="text-primary mt-1" />
          <div>
            <h3 className="font-medium mb-2">Data Protection</h3>
            <p className="text-sm text-gray-400">
              Your data is encrypted and stored securely. We never share your information without your explicit consent.
              All data transfers are protected with industry-standard encryption protocols.
            </p>
          </div>
        </div>
        <motion.a
          href="/privacy-policy"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center space-x-1 text-primary hover:text-primary/80 group"
          whileHover={{ x: 5 }}
        >
          <span className="relative">
            View Privacy Policy
            <motion.span
              className="absolute bottom-0 left-0 w-full h-0.5 bg-primary origin-left"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.2 }}
            />
          </span>
          <ExternalLink size={14} className="transition-transform group-hover:translate-x-1" />
        </motion.a>
      </div>
    </div>
  );
}