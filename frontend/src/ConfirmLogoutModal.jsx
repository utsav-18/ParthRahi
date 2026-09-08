import React from 'react';

const ConfirmLogoutModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="relative bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors text-xl leading-none"
          aria-label="Close"
        >
          &times;
        </button>

        <div className="mb-6">
          <h2 className="text-xl font-semibold text-white">Sign Out</h2>
          <p className="text-slate-400 text-sm mt-3">Are you sure you want to sign out of your account?</p>
        </div>

        <div className="flex gap-4 mt-8">
          <button 
            onClick={onClose}
            className="cursor-pointer  flex-1 py-2.5 rounded-xl border border-slate-600 text-white font-medium text-sm hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="cursor-pointer  flex-1 py-2.5 rounded-xl bg-red-500/10 border border-red-500/50 text-red-400 font-medium text-sm hover:bg-red-500/20 transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmLogoutModal;
