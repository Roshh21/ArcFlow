import React from 'react';

const SettingsModal = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-lg shadow-xl p-8 w-full max-w-lg">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Settings</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Appearance</h3>
          <div className="flex items-center justify-between">
            <span>Dark/Light Mode</span>
            {/* The ThemeToggle component will go here */}
            <ThemeToggle />
          </div>
          {/* Future settings like graphics mode and text settings */}
          <div className="pt-4 border-t border-gray-700">
            <h3 className="text-lg font-semibold mb-2">Graphics Mode (Future)</h3>
            <p className="text-gray-400 text-sm">Animatic, 2D, Normal</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;