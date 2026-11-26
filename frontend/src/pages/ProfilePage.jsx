import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { 
  User, 
  Mail, 
  Calendar, 
  ShieldCheck, 
  Briefcase, 
  Plus, 
  Trash2, 
  Sparkles,
  Save,
  Check,
  Pencil,
  Crown
} from 'lucide-react';

const ProfilePage = () => {
  const { user, fetchProfile, becomeHotelManager, isManager } = useAuth();

  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [gender, setGender] = useState('MALE');
  const [dateOfBirth, setDateOfBirth] = useState('');

  const [guests, setGuests] = useState([]);
  const [newGuestName, setNewGuestName] = useState('');
  const [newGuestPhone, setNewGuestPhone] = useState('');
  const [newGuestGender, setNewGuestGender] = useState('MALE');
  const [newGuestDob, setNewGuestDob] = useState('');
  const [showAddGuest, setShowAddGuest] = useState(false);

  // Edit Guest State
  const [editingGuestId, setEditingGuestId] = useState(null);
  const [editGuestName, setEditGuestName] = useState('');
  const [editGuestPhone, setEditGuestPhone] = useState('');
  const [editGuestGender, setEditGuestGender] = useState('MALE');
  const [editGuestDob, setEditGuestDob] = useState('');

  const [savingProfile, setSavingProfile] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhoneNumber(user.phoneNumber || '');
      setGender(user.gender || 'MALE');
      setDateOfBirth(user.dateOfBirth || '');
    }
    loadGuests();
  }, [user]);

  const loadGuests = async () => {
    try {
      const res = await api.get('/users/guests');
      setGuests(res.data.data || res.data || []);
    } catch (err) {
      console.error('Failed to load guests', err);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    setMsg('');
    try {
      await api.patch('/users/profile', {
        name,
        phoneNumber: phoneNumber || null,
        gender,
        dateOfBirth: dateOfBirth || null,
      });
      await fetchProfile();
      setMsg('Profile updated successfully!');
    } catch (err) {
      alert('Failed to update profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  const [showManagerModal, setShowManagerModal] = useState(false);
  const [secretCode, setSecretCode] = useState('');
  const [managerErr, setManagerErr] = useState('');
  const [upgrading, setUpgrading] = useState(false);

  const handleBecomeManagerSubmit = async (e) => {
    e.preventDefault();
    if (!secretCode.trim()) {
      setManagerErr('Secret Code is required.');
      return;
    }
    setUpgrading(true);
    setManagerErr('');
    try {
      await becomeHotelManager(secretCode.trim());
      alert('🎉 Congratulations! Account access upgraded successfully!');
      setShowManagerModal(false);
      setSecretCode('');
    } catch (err) {
      console.error('Become Manager Error:', err);
      const errorMsg = err.response?.data?.error?.message || err.response?.data?.apiError?.message || err.response?.data?.message || err.message || 'Upgrade failed.';
      setManagerErr(errorMsg);
    } finally {
      setUpgrading(false);
    }
  };

  const handleAddGuest = async (e) => {
    e.preventDefault();
    try {
      await api.post('/users/guests', {
        name: newGuestName,
        phoneNumber: newGuestPhone ? `+91 ${newGuestPhone}` : null,
        gender: newGuestGender,
        dateOfBirth: newGuestDob || null,
      });
      setNewGuestName('');
      setNewGuestPhone('');
      setNewGuestDob('');
      setShowAddGuest(false);
      loadGuests();
    } catch (err) {
      alert('Failed to add guest.');
    }
  };

  const handleDeleteGuest = async (guestId) => {
    try {
      await api.delete(`/users/guests/${guestId}`);
      loadGuests();
    } catch (err) {
      console.error('Delete Guest Error:', err);
      const msg = err.response?.data?.apiError?.message || err.response?.data?.message || err.message || 'Failed to delete guest.';
      alert(`⚠️ Delete Error: ${msg}`);
    }
  };

  const startEditGuest = (g) => {
    setEditingGuestId(g.id);
    setEditGuestName(g.name || '');
    setEditGuestPhone(g.phoneNumber ? g.phoneNumber.replace(/^\+91\s?/, '') : '');
    setEditGuestGender(g.gender || 'MALE');
    setEditGuestDob(g.dateOfBirth || '');
  };

  const handleUpdateGuest = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/users/guests/${editingGuestId}`, {
        name: editGuestName,
        phoneNumber: editGuestPhone ? `+91 ${editGuestPhone}` : null,
        gender: editGuestGender,
        dateOfBirth: editGuestDob || null,
      });
      setEditingGuestId(null);
      loadGuests();
    } catch (err) {
      console.error('Update Guest Error:', err);
      const msg = err.response?.data?.apiError?.message || err.response?.data?.message || err.message || 'Failed to update guest.';
      alert(`⚠️ Update Error: ${msg}`);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="glass-panel p-8 rounded-3xl border border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-500 text-white flex items-center justify-center font-bold text-2xl shadow-lg">
            {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-white">{user.name || user.email}</h1>
            <p className="text-sm text-slate-400 flex items-center gap-2 mt-0.5">
              <Mail className="w-3.5 h-3.5 text-sky-400" /> {user.email}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {user && user.roles && (user.roles.includes('SUPER_ADMIN') || user.roles.includes('ROLE_SUPER_ADMIN')) ? (
            <span className="px-3.5 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Crown className="w-3.5 h-3.5 text-amber-400" /> Super Admin
            </span>
          ) : isManager ? (
            <span className="px-3.5 py-1.5 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-300 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-sky-400" /> Hotel Manager
            </span>
          ) : null}

          <button
            onClick={() => {
              setManagerErr('');
              setSecretCode('');
              setShowManagerModal(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20 text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" /> Upgrade Access
          </button>
        </div>
      </div>

      {/* Authorization Upgrade Modal */}
      {showManagerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="glass-panel p-6 rounded-3xl max-w-md w-full border border-slate-700 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Crown className="w-5 h-5 text-amber-400" /> Upgrade Account Access
              </h3>
              <button onClick={() => setShowManagerModal(false)} className="text-slate-400 hover:text-white text-sm">✕</button>
            </div>
            <form onSubmit={handleBecomeManagerSubmit} className="space-y-4">
              <p className="text-xs text-slate-400 leading-relaxed">
                Enter your Secret Authorization Passcode to upgrade access and assign roles.
              </p>
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Authorization Passcode *
                </label>
                <input
                  type="password"
                  required
                  placeholder="Enter Code (e.g. SUPERADMIN123)"
                  value={secretCode}
                  onChange={(e) => setSecretCode(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm font-mono tracking-wider focus:outline-none focus:border-amber-400"
                />
                <div className="text-[11px] text-amber-400 font-medium mt-2 space-y-1">
                  <p className="flex items-center gap-1">
                    👑 Super Admin: <code className="bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30 font-bold select-all">SUPERADMIN123</code>
                  </p>
                  <p className="flex items-center gap-1 text-sky-400">
                    💼 Hotel Manager: <code className="bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/30 font-bold select-all">HEAVEN2026</code>
                  </p>
                </div>
              </div>

              {managerErr && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
                  ⚠️ {managerErr}
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button type="button" onClick={() => setShowManagerModal(false)} className="px-4 py-2 text-xs text-slate-400">Cancel</button>
                <button type="submit" disabled={upgrading} className="gradient-btn px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-200" />
                  {upgrading ? 'Verifying...' : 'Unlock Manager Access'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Update Profile Form */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-6">
          <h3 className="text-lg font-bold text-white border-b border-slate-800 pb-3">Personal Details</h3>

          {msg && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400" /> {msg}
            </div>
          )}

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 uppercase tracking-wider mb-1.5">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 uppercase tracking-wider mb-1.5">Mobile Number</label>
              <div className="relative flex items-center group">
                <span className="absolute left-3.5 text-slate-400 font-semibold text-xs select-none group-hover:text-sky-400 group-focus-within:text-sky-400 transition-colors pointer-events-none">
                  🇮🇳 +91
                </span>
                <input
                  type="tel"
                  maxLength={10}
                  placeholder="9876543210"
                  value={(phoneNumber || '').replace(/^\+91\s?/, '')}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                    setPhoneNumber(val ? `+91 ${val}` : '');
                  }}
                  className="w-full pl-16 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-white placeholder-slate-600 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 text-sm font-mono tracking-wider transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 uppercase tracking-wider mb-1.5">Date of Birth</label>
                <input
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 uppercase tracking-wider mb-1.5">Gender</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-sky-500"
                >
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={savingProfile}
              className="gradient-btn px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2"
            >
              <Save className="w-4 h-4" /> Save Profile
            </button>
          </form>
        </div>

        {/* Saved Guests for Booking */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-lg font-bold text-white">Saved Guest Profiles</h3>
            <button
              type="button"
              onClick={() => setShowAddGuest(true)}
              className="px-3 py-1.5 rounded-xl bg-sky-500/10 border border-sky-500/30 text-sky-400 text-xs font-semibold flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" /> Add Guest
            </button>
          </div>

          {showAddGuest && (
            <form onSubmit={handleAddGuest} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <input
                type="text"
                required
                placeholder="Guest Full Name"
                value={newGuestName}
                onChange={(e) => setNewGuestName(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-sky-500"
              />
              <div className="relative flex items-center group">
                <span className="absolute left-3 text-slate-400 font-semibold text-xs select-none pointer-events-none">+91</span>
                <input
                  type="tel"
                  maxLength={10}
                  placeholder="9876543210"
                  value={newGuestPhone}
                  onChange={(e) => setNewGuestPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  className="w-full pl-11 pr-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-sky-500 font-mono tracking-wider"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] text-slate-400 font-semibold uppercase mb-1">Date of Birth</label>
                  <input
                    type="date"
                    value={newGuestDob}
                    onChange={(e) => setNewGuestDob(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 font-semibold uppercase mb-1">Gender</label>
                  <select
                    value={newGuestGender}
                    onChange={(e) => setNewGuestGender(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-sky-500"
                  >
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button type="button" onClick={() => setShowAddGuest(false)} className="text-xs text-slate-400 px-2 py-1">Cancel</button>
                <button type="submit" className="px-3.5 py-1.5 rounded-lg bg-sky-500 text-white text-xs font-semibold">Save Guest</button>
              </div>
            </form>
          )}

          {guests.length > 0 ? (
            <div className="space-y-3">
              {guests.map((g) => (
                <div key={g.id} className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                  {editingGuestId === g.id ? (
                    <form onSubmit={handleUpdateGuest} className="space-y-3">
                      <input
                        type="text"
                        required
                        placeholder="Guest Full Name"
                        value={editGuestName}
                        onChange={(e) => setEditGuestName(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-sky-500"
                      />
                      <div className="relative flex items-center group">
                        <span className="absolute left-3 text-slate-400 font-semibold text-xs select-none pointer-events-none">+91</span>
                        <input
                          type="tel"
                          maxLength={10}
                          placeholder="9876543210"
                          value={editGuestPhone}
                          onChange={(e) => setEditGuestPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                          className="w-full pl-11 pr-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-sky-500 font-mono tracking-wider"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] text-slate-400 font-semibold uppercase mb-1">Date of Birth</label>
                          <input
                            type="date"
                            value={editGuestDob}
                            onChange={(e) => setEditGuestDob(e.target.value)}
                            className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-sky-500"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-slate-400 font-semibold uppercase mb-1">Gender</label>
                          <select
                            value={editGuestGender}
                            onChange={(e) => setEditGuestGender(e.target.value)}
                            className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-sky-500"
                          >
                            <option value="MALE">Male</option>
                            <option value="FEMALE">Female</option>
                            <option value="OTHER">Other</option>
                          </select>
                        </div>
                      </div>
                      <div className="flex justify-end gap-2 pt-1">
                        <button type="button" onClick={() => setEditingGuestId(null)} className="text-xs text-slate-400 px-2 py-1">Cancel</button>
                        <button type="submit" className="px-3.5 py-1.5 rounded-lg bg-sky-500 text-white text-xs font-semibold">Save Edit</button>
                      </div>
                    </form>
                  ) : (
                    <div className="flex items-center justify-between text-sm">
                      <div>
                        <span className="font-semibold text-white block">{g.name}</span>
                        <span className="text-xs text-slate-500">
                          {g.gender || 'Guest'}
                          {g.phoneNumber ? ` • ${g.phoneNumber}` : ''}
                          {g.dateOfBirth ? ` • DOB: ${g.dateOfBirth}` : ''}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => startEditGuest(g)}
                          className="p-2 rounded-lg text-slate-400 hover:text-sky-400 hover:bg-sky-500/10 transition-colors"
                          title="Edit Guest"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteGuest(g.id)}
                          className="p-2 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                          title="Delete Guest"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500">No saved guests yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
