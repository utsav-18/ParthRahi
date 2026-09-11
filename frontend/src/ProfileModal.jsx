import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';
import { useLanguage } from './lib/i18n/LanguageContext';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const ProfileModal = ({ isOpen, onClose, user }) => {
  const { setUser } = useAuth();
  const { t } = useLanguage();

  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [phoneInput, setPhoneInput] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen && user) {
      setIsEditingPhone(false);
      setPhoneInput(user.phone || '');
      setPhoneError('');
      setIsSaving(false);
    }
  }, [isOpen, user]);

  if (!isOpen || !user) return null;

  // Helper for initials
  const getInitials = (name, email) => {
    if (name && name.trim()) {
      const parts = name.trim().split(/\s+/);
      if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
      }
      return parts[0].slice(0, 2).toUpperCase();
    }
    if (email) {
      return email.slice(0, 2).toUpperCase();
    }
    return 'PR';
  };

  const initials = getInitials(user.name, user.email);

  const handleStartEdit = () => {
    setPhoneInput(user.phone || '');
    setPhoneError('');
    setIsEditingPhone(true);
  };

  const handleCancelEdit = () => {
    setPhoneInput(user.phone || '');
    setPhoneError('');
    setIsEditingPhone(false);
  };

  const handleSavePhone = async (e) => {
    e?.preventDefault();
    setPhoneError('');

    const trimmed = phoneInput.trim();
    if (!trimmed) {
      setPhoneError(t('profile.errPhoneRequired'));
      return;
    }

    const cleanedPhone = trimmed.replace(/[\s-]/g, '');
    const phoneRegex = /^(\+?[1-9]\d{0,3})?\d{10}$/;
    if (!phoneRegex.test(cleanedPhone) || trimmed.length > 18) {
      setPhoneError(t('profile.errPhoneInvalid'));
      return;
    }

    setIsSaving(true);
    try {
      const response = await axios.put(
        `${API_BASE_URL}/api/auth/phone`,
        { phone: trimmed },
        { withCredentials: true }
      );

      if (response.data && response.data.user) {
        setUser(response.data.user);
      }
      setIsEditingPhone(false);
    } catch (err) {
      console.error('Failed to update phone:', err);
      setPhoneError(err.response?.data?.error || t('profile.errUpdateFailed'));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 transition-opacity duration-300"
      onClick={onClose}
    >
      <div
        className="relative bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-6 sm:p-8 w-full max-w-sm text-center transform transition-all duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors text-2xl leading-none cursor-pointer w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-800"
          aria-label="Close"
        >
          &times;
        </button>

        {/* Header Tag */}
        <div className="mb-6">
          <p className="text-[11px] tracking-[0.38em] uppercase text-cyan-400/90 font-medium">{t('auth.appName')}</p>
          <h2 className="text-xl font-semibold text-white mt-1">{t('profile.title')}</h2>
        </div>

        {/* Profile Picture / Initials Avatar */}
        <div className="flex justify-center mb-6">
          {user.profilePicture ? (
            <img
              src={user.profilePicture}
              alt={user.name || 'User profile'}
              className="w-24 h-24 rounded-full border-2 border-cyan-400/50 object-cover shadow-lg shadow-cyan-950/40"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 border-2 border-cyan-300/40 text-white font-bold text-2xl flex items-center justify-center shadow-lg shadow-cyan-950/40 tracking-wider">
              {initials}
            </div>
          )}
        </div>

        {/* Name */}
        <h3 className="text-xl font-semibold text-white tracking-wide">
          {user.name || t('profile.defaultTraveler')}
        </h3>

        {/* Details Card */}
        <div className="mt-6 space-y-3 text-left">
          {/* Mobile Number Section */}
          <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl px-4 py-3">
            <div className="flex items-center justify-between mb-1">
              <p className="text-[11px] uppercase tracking-wider text-slate-400 font-medium">
                {t('profile.mobileNumber')}
              </p>
              {!isEditingPhone && (
                <button
                  type="button"
                  onClick={handleStartEdit}
                  className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer"
                >
                  {t('profile.edit')}
                </button>
              )}
            </div>

            {isEditingPhone ? (
              <form onSubmit={handleSavePhone} className="mt-2 space-y-2">
                <input
                  type="tel"
                  autoFocus
                  placeholder={t('profile.mobilePlaceholder')}
                  value={phoneInput}
                  onChange={(e) => {
                    setPhoneInput(e.target.value);
                    if (phoneError) setPhoneError('');
                  }}
                  className="w-full bg-slate-900/80 border border-cyan-400/50 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-cyan-400 transition-all"
                />

                {phoneError && (
                  <p className="text-xs text-red-400 mt-1 leading-tight">{phoneError}</p>
                )}

                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    disabled={isSaving}
                    onClick={handleCancelEdit}
                    className="px-3 py-1.5 rounded-lg border border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white text-xs font-medium transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {t('profile.cancel')}
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-3.5 py-1.5 rounded-lg bg-cyan-300 text-slate-950 hover:bg-cyan-200 text-xs font-semibold transition-all shadow-sm cursor-pointer disabled:opacity-50"
                  >
                    {isSaving ? t('profile.saving') : t('profile.save')}
                  </button>
                </div>
              </form>
            ) : (
              <p className="text-sm font-medium text-white">
                {user.phone ? (
                  user.phone
                ) : (
                  <span className="text-slate-400 font-normal italic">{t('profile.mobileNotAdded')}</span>
                )}
              </p>
            )}
          </div>

          {/* Email Address */}
          <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl px-4 py-3">
            <p className="text-[11px] uppercase tracking-wider text-slate-400 font-medium mb-1">
              {t('profile.emailAddress')}
            </p>
            <p className="text-sm font-medium text-white break-all">
              {user.email || t('profile.emailNotAvailable')}
            </p>
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-8">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 rounded-xl border border-slate-600/80 text-slate-200 font-medium text-sm hover:bg-slate-800 hover:text-white active:scale-[0.98] transition-all cursor-pointer"
          >
            {t('profile.close')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;
