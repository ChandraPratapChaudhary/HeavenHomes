import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { 
  Users, 
  Building2, 
  BookOpen, 
  IndianRupee, 
  ShieldCheck, 
  Crown, 
  Search, 
  CheckCircle2, 
  XCircle, 
  RefreshCw,
  UserCheck,
  Building,
  KeyRound,
  Sparkles,
  Trash2
} from 'lucide-react';

const AdminDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [users, setUsers] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [activeTab, setActiveTab] = useState('users');

  const [loading, setLoading] = useState(true);
  const [userSearch, setUserSearch] = useState('');
  const [hotelSearch, setHotelSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [actionLoading, setActionLoading] = useState(false);
  const [msg, setMsg] = useState('');

  const [bookings, setBookings] = useState([]);
  const [bookingSearch, setBookingSearch] = useState('');

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [analyticsRes, usersRes, hotelsRes, bookingsRes] = await Promise.all([
        api.get('/admin/analytics'),
        api.get('/admin/users'),
        api.get('/admin/platform-hotels'),
        api.get('/admin/bookings'),
      ]);

      const analyticsData = analyticsRes.data.data || analyticsRes.data;
      setAnalytics(analyticsData);
      setUsers(usersRes.data.data || usersRes.data || []);
      setHotels(hotelsRes.data.data || hotelsRes.data || []);
      setBookings(bookingsRes.data.data || bookingsRes.data || []);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    setActionLoading(true);
    try {
      await api.patch(`/admin/users/${userId}/role?newRole=${newRole}`);
      setMsg(`User role updated to ${newRole} successfully!`);
      loadAdminData();
    } catch (err) {
      alert('Failed to update user role');
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleHotel = async (hotelId) => {
    setActionLoading(true);
    try {
      await api.patch(`/admin/hotels/${hotelId}/toggle-status`);
      setMsg('Hotel status updated successfully!');
      loadAdminData();
    } catch (err) {
      alert('Failed to toggle hotel status');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteBooking = async (bookingId) => {
    if (!window.confirm(`Are you sure you want to permanently delete Booking #${bookingId}?`)) {
      return;
    }
    setActionLoading(true);
    try {
      await api.delete(`/admin/bookings/${bookingId}`);
      setMsg(`Booking #${bookingId} deleted permanently.`);
      loadAdminData();
    } catch (err) {
      alert('Failed to delete booking.');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch = 
      (u.name && u.name.toLowerCase().includes(userSearch.toLowerCase())) ||
      (u.email && u.email.toLowerCase().includes(userSearch.toLowerCase())) ||
      (u.phoneNumber && u.phoneNumber.includes(userSearch));
    
    if (roleFilter === 'ALL') return matchesSearch;
    return matchesSearch && u.roles && u.roles.includes(roleFilter);
  });

  const filteredHotels = hotels.filter((h) => {
    return (
      (h.name && h.name.toLowerCase().includes(hotelSearch.toLowerCase())) ||
      (h.city && h.city.toLowerCase().includes(hotelSearch.toLowerCase()))
    );
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-sky-500/30 border-t-sky-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="glass-panel p-8 rounded-3xl border border-sky-500/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sky-400 font-semibold text-xs uppercase tracking-wider mb-1">
            <Crown className="w-4 h-4 text-amber-400" /> Super Admin Platform Control
          </div>
          <h1 className="text-3xl font-extrabold text-white">Master Developer Portal</h1>
          <p className="text-sm text-slate-400 mt-1">Platform-wide user management, property controls, and revenue intelligence.</p>
        </div>

        <button
          onClick={loadAdminData}
          className="px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh Data
        </button>
      </div>

      {/* Action Notification Message */}
      {msg && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm flex items-center justify-between">
          <span>{msg}</span>
          <button onClick={() => setMsg('')} className="text-xs text-slate-400 hover:text-white">Dismiss</button>
        </div>
      )}

      {/* Analytics KPI Cards */}
      {analytics && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 uppercase tracking-wider block font-semibold">Total Platform Users</span>
              <span className="text-2xl font-black text-white mt-1 block">{analytics.totalUsers}</span>
              <span className="text-xs text-sky-400 mt-1 block">{analytics.totalManagers} Hotel Managers</span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-sky-500/10 text-sky-400 flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 uppercase tracking-wider block font-semibold">Total Properties</span>
              <span className="text-2xl font-black text-white mt-1 block">{analytics.totalHotels}</span>
              <span className="text-xs text-emerald-400 mt-1 block">{analytics.totalActiveHotels} Active Properties</span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <Building2 className="w-6 h-6" />
            </div>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 uppercase tracking-wider block font-semibold">Total Bookings</span>
              <span className="text-2xl font-black text-white mt-1 block">{analytics.totalBookings}</span>
              <span className="text-xs text-amber-400 mt-1 block">Reservations Processed</span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <BookOpen className="w-6 h-6" />
            </div>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 uppercase tracking-wider block font-semibold">Platform Revenue</span>
              <span className="text-2xl font-black text-emerald-400 mt-1 block">
                ₹{Number(analytics.totalPlatformRevenue || 0).toLocaleString()}
              </span>
              <span className="text-xs text-slate-500 mt-1 block">Gross Confirmed Stays</span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <IndianRupee className="w-6 h-6" />
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-slate-800 gap-4">
        <button
          onClick={() => setActiveTab('users')}
          className={`pb-3 px-2 font-bold text-sm border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'users'
              ? 'border-sky-500 text-sky-400'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Users className="w-4 h-4" /> Registered Users ({filteredUsers.length})
        </button>

        <button
          onClick={() => setActiveTab('hotels')}
          className={`pb-3 px-2 font-bold text-sm border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'hotels'
              ? 'border-sky-500 text-sky-400'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Building className="w-4 h-4" /> Platform Hotels ({filteredHotels.length})
        </button>

        <button
          onClick={() => setActiveTab('bookings')}
          className={`pb-3 px-2 font-bold text-sm border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'bookings'
              ? 'border-sky-500 text-sky-400'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <BookOpen className="w-4 h-4" /> Platform Bookings ({bookings.length})
        </button>
      </div>

      {/* Tab 1: User Management */}
      {activeTab === 'users' && (
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search user name, email, phone..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-sky-500 text-sm"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-semibold uppercase">Role Filter:</span>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none"
              >
                <option value="ALL">All Roles</option>
                <option value="GUEST">Guest Only</option>
                <option value="HOTEL_MANAGER">Hotel Manager Only</option>
                <option value="SUPER_ADMIN">Super Admin Only</option>
              </select>
            </div>
          </div>

          {/* Users Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950 text-slate-400 text-xs uppercase border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Mobile Number</th>
                  <th className="py-3 px-4">Current Role</th>
                  <th className="py-3 px-4 text-right">Change Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredUsers.map((u) => {
                  const currentRole = u.roles && u.roles[0] ? u.roles[0] : 'GUEST';
                  return (
                    <tr key={u.id} className="hover:bg-slate-900/40 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-500 text-white flex items-center justify-center font-bold text-sm">
                            {u.name ? u.name.charAt(0).toUpperCase() : 'U'}
                          </div>
                          <div>
                            <span className="font-bold text-white block">{u.name || 'User'}</span>
                            <span className="text-xs text-slate-500">{u.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-xs text-slate-400">
                        {u.phoneNumber || 'N/A'}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
                          currentRole === 'SUPER_ADMIN'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : currentRole === 'HOTEL_MANAGER'
                            ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                            : 'bg-slate-800 text-slate-400'
                        }`}>
                          {currentRole}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <select
                          disabled={actionLoading}
                          value={currentRole}
                          onChange={(e) => handleRoleChange(u.id, e.target.value)}
                          className="px-3 py-1 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-sky-500 cursor-pointer"
                        >
                          <option value="GUEST">GUEST</option>
                          <option value="HOTEL_MANAGER">HOTEL_MANAGER</option>
                          <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Hotels Management */}
      {activeTab === 'hotels' && (
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-6">
          <div className="flex items-center justify-between">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search hotel name or city..."
                value={hotelSearch}
                onChange={(e) => setHotelSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-sky-500 text-sm"
              />
            </div>
          </div>

          {/* Hotels Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950 text-slate-400 text-xs uppercase border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Hotel Property</th>
                  <th className="py-3 px-4">City</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Master Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredHotels.map((h) => {
                  const isActive = Boolean(h.active);
                  return (
                    <tr key={h.id} className="hover:bg-slate-900/40 transition-colors">
                      <td className="py-3.5 px-4">
                        <div>
                          <span className="font-bold text-white block">{h.name}</span>
                          <span className="text-xs text-slate-500">ID #{h.id}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-1 rounded-full bg-slate-900 text-sky-400 text-xs font-medium">
                          {h.city}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
                          isActive
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}>
                          {isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          disabled={actionLoading}
                          onClick={() => handleToggleHotel(h.id)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                            isActive
                              ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30 hover:bg-rose-500/20'
                              : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20'
                          }`}
                        >
                          {isActive ? 'Force Deactivate' : 'Force Activate'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Platform Bookings */}
      {activeTab === 'bookings' && (
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search hotel name, status..."
                value={bookingSearch}
                onChange={(e) => setBookingSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-sky-500"
              />
            </div>
            <div className="text-xs text-slate-400 font-medium">
              Showing <span className="text-white font-bold">{bookings.length}</span> Total Platform Bookings
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-slate-400 border-b border-slate-800 uppercase tracking-wider font-semibold">
                  <th className="pb-3 px-4">Booking ID</th>
                  <th className="pb-3 px-4">Hotel & Room</th>
                  <th className="pb-3 px-4">Stay Dates</th>
                  <th className="pb-3 px-4">Amount</th>
                  <th className="pb-3 px-4">Status</th>
                  <th className="pb-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {bookings
                  .filter((b) => {
                    const q = bookingSearch.toLowerCase();
                    return (
                      (b.hotelName && b.hotelName.toLowerCase().includes(q)) ||
                      (b.bookingStatus && b.bookingStatus.toLowerCase().includes(q)) ||
                      (b.id && String(b.id).includes(q))
                    );
                  })
                  .map((b) => {
                    const isConfirmed = b.bookingStatus === 'CONFIRMED';
                    const isCancelled = b.bookingStatus === 'CANCELLED';
                    return (
                      <tr key={b.id} className="hover:bg-slate-900/40 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-sky-400">
                          #{b.id}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-semibold text-white block">{b.hotelName || 'Hotel Stay'}</span>
                          <span className="text-[11px] text-slate-500">{b.roomType || 'Room'} • {b.roomsCount || 1} Room(s)</span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-300">
                          {b.checkInDate} ➔ {b.checkOutDate}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-emerald-400 font-mono">
                          ₹{Number(b.amount || 0).toLocaleString()}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                            isConfirmed
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : isCancelled
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          }`}>
                            {b.bookingStatus}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            disabled={actionLoading}
                            onClick={() => handleDeleteBooking(b.id)}
                            className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors inline-flex items-center gap-1 text-xs font-semibold"
                            title="Delete Booking Permanently"
                          >
                            <Trash2 className="w-4 h-4" /> Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
