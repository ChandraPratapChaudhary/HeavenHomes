import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { 
  Building2, 
  Plus, 
  Zap, 
  CheckCircle2, 
  BarChart3, 
  Bed, 
  Calendar, 
  TrendingUp, 
  Sparkles,
  Sliders,
  DollarSign,
  Lock,
  Trash2
} from 'lucide-react';

const compressImageFile = (file, callback) => {
  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;
      const maxDim = 650;
      if (width > maxDim || height > maxDim) {
        if (width > height) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
      }
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);
      const compressedDataUri = canvas.toDataURL('image/jpeg', 0.70);
      callback(compressedDataUri);
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
};

const ManagerDashboard = () => {
  const { user, isManager, becomeHotelManager } = useAuth();

  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);

  // New Hotel Modal State
  const [showCreateHotel, setShowCreateHotel] = useState(false);
  const [hotelName, setHotelName] = useState('');
  const [hotelCity, setHotelCity] = useState('');
  const [hotelAddress, setHotelAddress] = useState('');
  const [hotelPhone, setHotelPhone] = useState('');
  const [hotelPhotos, setHotelPhotos] = useState([]);
  const [hotelAmenities, setHotelAmenities] = useState([]);

  const ALL_AMENITIES = [
    { id: 'WIFI', label: 'WiFi', icon: '📶' },
    { id: 'POOL', label: 'Pool', icon: '🏊' },
    { id: 'AC', label: 'AC', icon: '❄️' },
    { id: 'BREAKFAST', label: 'Breakfast', icon: '🍳' },
    { id: 'GYM', label: 'Gym', icon: '🏋️' },
    { id: 'PARKING', label: 'Parking', icon: '🅿️' },
    { id: 'SPA', label: 'Spa', icon: '💆' },
    { id: 'RESTAURANT', label: 'Restaurant', icon: '🍽️' },
    { id: 'TV', label: 'TV', icon: '📺' },
    { id: 'ROOM_SERVICE', label: 'Room Service', icon: '🛎️' },
  ];

  // Selected Hotel Detail View (Rooms & Reports)
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [report, setReport] = useState(null);

  // New Room Form State
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [roomType, setRoomType] = useState('Deluxe Suite');
  const [roomBasePrice, setRoomBasePrice] = useState(3500);
  const [roomTotalCount, setRoomTotalCount] = useState(10);
  const [roomCapacity, setRoomCapacity] = useState(2);
  const [roomPhotos, setRoomPhotos] = useState([]);

  // Inventory Management State
  const [selectedRoomForInv, setSelectedRoomForInv] = useState(null);
  const [inventoryList, setInventoryList] = useState([]);
  const [surgeFactor, setSurgeFactor] = useState(1.0);
  const [isClosed, setIsClosed] = useState(false);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]);
  // Calendar navigation state — which month/year is currently visible
  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());
  const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth()); // 0-indexed

  const loadHotels = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/hotels');
      const data = res.data.data ? res.data.data.content : res.data.content || [];
      setHotels(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isManager) loadHotels();
  }, [isManager]);

  const handleCreateHotel = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/hotels', {
        name: hotelName,
        city: hotelCity,
        photos: hotelPhotos,
        amenities: hotelAmenities,
        contactInfo: {
          address: hotelAddress,
          phoneNumber: hotelPhone,
        },
      });
      setShowCreateHotel(false);
      setHotelName('');
      setHotelCity('');
      setHotelAddress('');
      setHotelPhone('');
      setHotelPhotos([]);
      setHotelAmenities([]);
      loadHotels();
    } catch (err) {
      console.error('Create Hotel Error:', err);
      const msg = err.response?.data?.error?.message || err.response?.data?.apiError?.message || err.response?.data?.message || err.message || 'Failed to create hotel.';
      alert(`⚠️ Create Hotel Error: ${msg}`);
    }
  };

  const [uploading, setUploading] = useState(false);

  const handleActivateHotel = async (hotelId) => {
    try {
      await api.patch(`/admin/hotels/${hotelId}/activate`);
      loadHotels();
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.error?.message || err.response?.data?.apiError?.message || err.response?.data?.message || err.message || 'Failed to update hotel status.';
      alert(`⚠️ Status Error: ${msg}`);
    }
  };

  const handleDeleteHotel = async (hotelId, hotelName, e) => {
    if (e) e.stopPropagation();
    if (!window.confirm(`Are you sure you want to delete "${hotelName}" (ID #${hotelId})? This will delete all associated rooms and inventory.`)) {
      return;
    }
    try {
      await api.delete(`/admin/hotels/${hotelId}`);
      alert('Hotel deleted successfully!');
      if (selectedHotel && selectedHotel.id === hotelId) {
        setSelectedHotel(null);
      }
      loadHotels();
    } catch (err) {
      console.error('Delete Hotel Error:', err);
      const msg = err.response?.data?.error?.message || err.response?.data?.message || err.message || 'Failed to delete hotel.';
      alert(`⚠️ Delete Hotel Error: ${msg}`);
    }
  };

  const handleUploadHotelPhoto = async (hotelId, e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    setUploading(true);
    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);
        const res = await api.post(`/admin/hotels/${hotelId}/photos`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        const updatedHotel = res.data.data || res.data;
        if (selectedHotel && selectedHotel.id === hotelId) {
          setSelectedHotel(updatedHotel);
        }
      }
      loadHotels();
    } catch (err) {
      console.error('Photo Upload Error:', err);
      const msg = err.response?.data?.error?.message || err.response?.data?.apiError?.message || err.response?.data?.message || err.message || 'Failed to upload photo.';
      alert(`⚠️ Upload Error: ${msg}`);
    } finally {
      e.target.value = '';
      setUploading(false);
    }
  };

  const handleDeleteHotelPhoto = async (hotelId, photoUrl) => {
    try {
      const res = await api.delete(`/admin/hotels/${hotelId}/photos`, {
        data: { photoUrl },
      });
      const updatedHotel = res.data.data || res.data;
      loadHotels();
      if (selectedHotel && selectedHotel.id === hotelId) {
        setSelectedHotel(updatedHotel);
      }
    } catch (err) {
      console.error('Delete Hotel Photo Error:', err);
      const msg = err.response?.data?.error?.message || err.response?.data?.message || err.message || 'Failed to delete photo.';
      alert(`⚠️ Delete Error: ${msg}`);
    }
  };

  const handleUploadRoomPhoto = async (roomId, e) => {
    const files = Array.from(e.target.files);
    if (!files.length || !selectedHotel) return;

    setUploading(true);
    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);
        await api.post(`/admin/hotels/${selectedHotel.id}/rooms/${roomId}/photos`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }
      handleSelectHotel(selectedHotel);
    } catch (err) {
      console.error('Room Photo Upload Error:', err);
      const msg = err.response?.data?.error?.message || err.response?.data?.apiError?.message || err.response?.data?.message || err.message || 'Failed to upload room photo.';
      alert(`⚠️ Room Upload Error: ${msg}`);
    } finally {
      e.target.value = '';
      setUploading(false);
    }
  };

  const handleDeleteRoomPhoto = async (roomId, photoUrl) => {
    if (!selectedHotel) return;
    try {
      await api.delete(`/admin/hotels/${selectedHotel.id}/rooms/${roomId}/photos`, {
        data: { photoUrl },
      });
      handleSelectHotel(selectedHotel);
    } catch (err) {
      console.error('Delete Room Photo Error:', err);
      const msg = err.response?.data?.error?.message || err.response?.data?.message || err.message || 'Failed to delete room photo.';
      alert(`⚠️ Delete Error: ${msg}`);
    }
  };

  const handleDeleteRoom = async (roomId, roomType) => {
    if (!selectedHotel) return;
    if (!window.confirm(`Are you sure you want to delete room category "${roomType}"?`)) {
      return;
    }
    try {
      await api.delete(`/admin/hotels/${selectedHotel.id}/rooms/${roomId}`);
      alert('Room category deleted successfully!');
      handleSelectHotel(selectedHotel);
    } catch (err) {
      console.error('Delete Room Error:', err);
      const msg = err.response?.data?.error?.message || err.response?.data?.message || err.message || 'Failed to delete room.';
      alert(`⚠️ Delete Room Error: ${msg}`);
    }
  };

  const handleSelectHotel = async (hotel) => {
    setSelectedHotel(hotel);
    try {
      const [roomsRes, reportRes] = await Promise.all([
        api.get(`/admin/hotels/${hotel.id}/rooms`),
        api.get(`/admin/hotels/${hotel.id}/reports`),
      ]);
      setRooms(roomsRes.data.data || roomsRes.data || []);
      setReport(reportRes.data.data || reportRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    if (!selectedHotel) return;
    try {
      await api.post(`/admin/hotels/${selectedHotel.id}/rooms`, {
        type: roomType,
        basePrice: Number(roomBasePrice),
        totalCount: Number(roomTotalCount),
        capacity: Number(roomCapacity),
        photos: roomPhotos,
      });
      setRoomPhotos([]);
      setShowCreateRoom(false);
      handleSelectHotel(selectedHotel);
    } catch (err) {
      alert('Failed to create room.');
    }
  };

  const handleLoadInventory = async (room) => {
    setSelectedRoomForInv(room);
    try {
      const res = await api.get(`/admin/inventory/rooms/${room.id}`);
      setInventoryList(res.data.data || res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateInventory = async (e) => {
    e.preventDefault();
    if (!selectedRoomForInv) return;
    try {
      await api.patch(`/admin/inventory/rooms/${selectedRoomForInv.id}`, {
        startDate,
        endDate,
        surgeFactor: Number(surgeFactor),
        closed: isClosed,
      });
      alert('Inventory pricing & closure updated successfully!');
      handleLoadInventory(selectedRoomForInv);
    } catch (err) {
      alert('Failed to update inventory.');
    }
  };

  const [secretCodeInput, setSecretCodeInput] = useState('');
  const [upgradeError, setUpgradeError] = useState('');
  const [upgrading, setUpgrading] = useState(false);

  const handleSelfUpgrade = async (e) => {
    e.preventDefault();
    if (!secretCodeInput.trim()) {
      setUpgradeError('Please enter the Admin Secret Access Code.');
      return;
    }
    setUpgrading(true);
    setUpgradeError('');
    try {
      await becomeHotelManager(secretCodeInput.trim());
      alert('🎉 Authorization Successful! You are now registered as a Hotel Manager.');
      loadHotels();
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.apiError?.message || err.response?.data?.message || 'Invalid Secret Access Code. Please verify your admin credentials.';
      setUpgradeError(msg);
    } finally {
      setUpgrading(false);
    }
  };

  if (!isManager) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto border border-amber-500/30">
          <Lock className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-extrabold text-white tracking-tight">Hotel Manager Access Required</h2>
          <p className="text-slate-400 text-sm">
            Your account currently has the <strong className="text-slate-200">GUEST</strong> role. Enter your Secret Admin Access Code to unlock hotel registration, inventory controls, and revenue analytics.
          </p>
        </div>

        <form onSubmit={handleSelfUpgrade} className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4 max-w-md mx-auto text-left">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Secret Authorization Passcode *
            </label>
            <input
              type="password"
              required
              placeholder="Enter Code (e.g. HEAVEN2026)"
              value={secretCodeInput}
              onChange={(e) => {
                setSecretCodeInput(e.target.value);
                setUpgradeError('');
              }}
              className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 text-sm font-mono tracking-widest"
            />
            <p className="text-[11px] text-amber-400 font-medium pt-1 flex items-center gap-1">
              💡 Demo Passcode: <code className="bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30 font-bold select-all">HEAVEN2026</code>
            </p>
          </div>

          {upgradeError && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium">
              ⚠️ {upgradeError}
            </div>
          )}

          <button
            type="submit"
            disabled={upgrading}
            className="w-full gradient-btn py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2"
          >
            {upgrading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-200" />
                <span>Unlock Manager Access</span>
              </>
            )}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="glass-panel p-8 rounded-3xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
          <span className="text-xs uppercase tracking-wider text-amber-400 font-semibold flex items-center gap-1 mb-1">
            <Sparkles className="w-4 h-4" /> Hotel Owner Operations Portal
          </span>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Manager Dashboard</h1>
          <p className="text-sm text-slate-400 mt-1">Manage luxury properties, room inventories, dynamic surge factors, and revenue reports.</p>
        </div>

        <button
          onClick={() => setShowCreateHotel(true)}
          className="gradient-btn px-5 py-3 rounded-xl font-semibold text-sm flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Register New Hotel
        </button>
      </div>

      {/* New Hotel Modal */}
      {showCreateHotel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="glass-panel p-8 rounded-3xl max-w-lg w-full border border-slate-700 space-y-4">
            <h3 className="text-xl font-bold text-white">Register New Property</h3>
            <form onSubmit={handleCreateHotel} className="space-y-3">
              <input
                type="text"
                required
                placeholder="Hotel Name (e.g. Grand Horizon Villa)"
                value={hotelName}
                onChange={(e) => setHotelName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm"
              />
              <input
                type="text"
                required
                placeholder="City (e.g. Mumbai, Goa)"
                value={hotelCity}
                onChange={(e) => setHotelCity(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm"
              />
              <input
                type="text"
                placeholder="Address"
                value={hotelAddress}
                onChange={(e) => setHotelAddress(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm"
              />
              <label className="w-full cursor-pointer px-4 py-2.5 rounded-xl bg-sky-500/10 border border-sky-500/30 text-sky-300 hover:bg-sky-500/20 text-xs font-semibold flex items-center justify-center gap-2">
                <Plus className="w-4 h-4 text-sky-400" />
                <span>{hotelPhotos.length > 0 ? `✅ ${hotelPhotos.length} Photo(s) Selected` : '📷 Select Hotel JPG Photos'}</span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const files = Array.from(e.target.files);
                    if (!files.length) return;
                    files.forEach((file) => {
                      compressImageFile(file, (compressedUri) => {
                        setHotelPhotos((prev) => [...prev, compressedUri]);
                      });
                    });
                  }}
                />
              </label>

              {/* Hotel Photos Preview Thumbnails */}
              {hotelPhotos.length > 0 && (
                <div className="pt-2 border-t border-slate-900 flex flex-wrap gap-2 items-center">
                  <span className="text-[11px] text-slate-400 font-medium mr-2">Hotel Previews:</span>
                  {hotelPhotos.map((photoSrc, idx) => (
                    <div key={idx} className="relative group/hpimg w-10 h-10 rounded-lg overflow-hidden border border-slate-800 bg-slate-900">
                      <img src={photoSrc} alt="Hotel Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setHotelPhotos((prev) => prev.filter((_, i) => i !== idx))}
                        className="absolute inset-0 bg-rose-950/80 text-rose-300 opacity-0 group-hover/hpimg:opacity-100 flex items-center justify-center transition-opacity text-xs"
                        title="Remove photo"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {/* Amenities Checkboxes */}
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Amenities</p>
                <div className="grid grid-cols-2 gap-2">
                  {ALL_AMENITIES.map((a) => (
                    <label
                      key={a.id}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors border text-xs font-medium ${
                        hotelAmenities.includes(a.id)
                          ? 'bg-sky-500/15 border-sky-500/40 text-sky-300'
                          : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:border-slate-600'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={hotelAmenities.includes(a.id)}
                        onChange={() => setHotelAmenities((prev) =>
                          prev.includes(a.id) ? prev.filter((x) => x !== a.id) : [...prev, a.id]
                        )}
                        className="sr-only"
                      />
                      <span>{a.icon}</span> {a.label}
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowCreateHotel(false)} className="px-4 py-2 text-sm text-slate-400">Cancel</button>
                <button type="submit" className="gradient-btn px-5 py-2 rounded-xl text-sm font-semibold">Save Hotel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Hotels Grid */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-white">My Properties</h3>

        {loading ? (
          <div className="h-32 glass-card rounded-2xl animate-pulse" />
        ) : hotels.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {hotels.map((h) => (
              <div
                key={h.id}
                onClick={() => handleSelectHotel(h)}
                className={`glass-card p-6 rounded-3xl border cursor-pointer transition-all ${
                  selectedHotel?.id === h.id ? 'border-sky-500 bg-sky-500/10' : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex justify-between items-start mb-3">
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-950 border border-slate-800 text-slate-300">
                    {h.city}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {h.active ? (
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Active
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleActivateHotel(h.id);
                          }}
                          className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-900 border border-slate-700 text-slate-400 hover:text-amber-300 hover:border-amber-500/40 hover:bg-amber-500/10 transition-colors"
                          title="Deactivate Hotel"
                        >
                          Deactivate
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleActivateHotel(h.id);
                        }}
                        className="text-xs font-semibold px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 hover:bg-amber-500/30"
                      >
                        Activate Hotel
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={(e) => handleDeleteHotel(h.id, h.name, e)}
                      className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      title="Delete Property"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <h4 className="text-lg font-bold text-white">{h.name}</h4>
                <p className="text-xs text-slate-400 mt-1">ID #{h.id}</p>

                {/* Uploaded Photos Section */}
                <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-2" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Photos ({h.photos ? h.photos.length : 0})</span>
                    <label className="cursor-pointer px-2.5 py-1 rounded-lg bg-sky-500/10 border border-sky-500/30 text-sky-400 hover:bg-sky-500/20 text-[11px] font-semibold inline-flex items-center gap-1">
                      <Plus className="w-3 h-3" /> Upload File
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleUploadHotelPhoto(h.id, e)}
                      />
                    </label>
                  </div>

                  {h.photos && h.photos.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {h.photos.map((url, idx) => (
                        <div key={idx} className="relative group/img w-10 h-10 rounded-lg overflow-hidden border border-slate-700 bg-slate-900">
                          <img src={url} alt="Hotel" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => handleDeleteHotelPhoto(h.id, url)}
                            className="absolute inset-0 bg-rose-950/80 text-rose-300 opacity-0 group-hover/img:opacity-100 flex items-center justify-center transition-opacity"
                            title="Delete photo"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-400">No hotels registered yet. Click "Register New Hotel" above.</p>
        )}
      </div>

      {/* Selected Hotel Management Section */}
      {selectedHotel && (
        <div className="space-y-8 pt-6 border-t border-slate-800">
          {/* ═══════════════════════════════════════════════
              📊 ANALYTICS DASHBOARD (Option 5)
          ═══════════════════════════════════════════════ */}
          {report && (() => {
            const confirmedBookings = Number(report.bookingCount || report.totalConfirmedBookings || 0);
            const totalRev = Number(report.totalRevenue || report.totalRevenueOfConfirmedBookings || 0);
            const avgRev = Number(report.avgRevenue || (confirmedBookings > 0 ? Math.round(totalRev / confirmedBookings) : 0));

            // Simulate monthly distribution (real app would use /reports?groupBy=month)
            const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
            const monthlyRevenue = MONTHS.map((m, i) => {
              // Approximate a sine-wave pattern seeded by hotel id for visual variety
              const seed = ((selectedHotel.id || 1) * (i + 1) * 31) % 100;
              return { month: m, revenue: Math.round(totalRev * (0.04 + seed * 0.008)) };
            });
            const maxMonthlyRev = Math.max(...monthlyRevenue.map(d => d.revenue), 1);

            // ── Occupancy Data from real bookings & rooms
            const totalRooms = rooms.reduce((s, r) => s + (r.totalCount || 0), 0);
            const bookedRooms = Math.min(confirmedBookings, totalRooms);
            const availRooms = Math.max(0, totalRooms - bookedRooms);
            const occupancyPct = totalRooms > 0 ? Math.round((bookedRooms / totalRooms) * 100) : 0;

            return (
              <div className="space-y-6">
                {/* ── KPI Summary Row ── */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    {
                      label: 'Confirmed Bookings',
                      value: confirmedBookings,
                      sub: 'Total successful bookings',
                      icon: <Calendar className="w-5 h-5" />,
                      color: 'sky',
                      gradient: 'from-sky-500/20 to-blue-500/10',
                      border: 'border-sky-500/30',
                      textColor: 'text-sky-400',
                    },
                    {
                      label: 'Total Revenue',
                      value: `₹${totalRev.toLocaleString('en-IN')}`,
                      sub: 'Confirmed booking revenue',
                      icon: <TrendingUp className="w-5 h-5" />,
                      color: 'emerald',
                      gradient: 'from-emerald-500/20 to-teal-500/10',
                      border: 'border-emerald-500/30',
                      textColor: 'text-emerald-400',
                    },
                    {
                      label: 'Avg per Booking',
                      value: `₹${avgRev.toLocaleString('en-IN')}`,
                      sub: 'Average booking value',
                      icon: <DollarSign className="w-5 h-5" />,
                      color: 'amber',
                      gradient: 'from-amber-500/20 to-orange-500/10',
                      border: 'border-amber-500/30',
                      textColor: 'text-amber-400',
                    },
                  ].map((kpi) => (
                    <div key={kpi.label} className={`glass-panel p-6 rounded-2xl border ${kpi.border} bg-gradient-to-br ${kpi.gradient} space-y-3`}>
                      <div className="flex items-center justify-between">
                        <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">{kpi.label}</span>
                        <span className={`${kpi.textColor} bg-white/5 p-2 rounded-xl`}>{kpi.icon}</span>
                      </div>
                      <div className={`text-3xl font-extrabold ${kpi.textColor}`}>{kpi.value}</div>
                      <p className="text-xs text-slate-500">{kpi.sub}</p>
                    </div>
                  ))}
                </div>

                {/* ── Charts Row ── */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                  {/* Monthly Revenue Bar Chart (2/3 width) */}
                  <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-slate-800">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h4 className="text-base font-bold text-white flex items-center gap-2">
                          <BarChart3 className="w-4 h-4 text-sky-400" /> Monthly Revenue Trend
                        </h4>
                        <p className="text-xs text-slate-500 mt-0.5">Estimated monthly earnings distribution</p>
                      </div>
                      <span className="text-xs bg-sky-500/10 text-sky-400 border border-sky-500/30 px-2.5 py-1 rounded-full font-medium">
                        {new Date().getFullYear()}
                      </span>
                    </div>
                    {/* SVG Bar Chart */}
                    <div className="relative h-44">
                      <svg viewBox="0 0 600 160" className="w-full h-full" preserveAspectRatio="none">
                        {/* Grid lines */}
                        {[0,1,2,3,4].map((i) => (
                          <line key={i} x1="0" y1={i * 32} x2="600" y2={i * 32}
                            stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                        ))}
                        {/* Bars */}
                        {monthlyRevenue.map((d, i) => {
                          const barH = maxMonthlyRev > 0 ? (d.revenue / maxMonthlyRev) * 130 : 0;
                          const x = i * 50 + 5;
                          const isCurrentMonth = i === new Date().getMonth();
                          return (
                            <g key={d.month}>
                              <rect
                                x={x} y={155 - barH} width="38" height={barH}
                                rx="4"
                                fill={isCurrentMonth
                                  ? 'url(#currentBar)'
                                  : 'url(#normalBar)'}
                                opacity={isCurrentMonth ? 1 : 0.75}
                              />
                            </g>
                          );
                        })}
                        {/* Gradient Defs */}
                        <defs>
                          <linearGradient id="normalBar" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.9" />
                            <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.4" />
                          </linearGradient>
                          <linearGradient id="currentBar" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#f59e0b" stopOpacity="1" />
                            <stop offset="100%" stopColor="#ea580c" stopOpacity="0.7" />
                          </linearGradient>
                        </defs>
                      </svg>
                      {/* Month Labels */}
                      <div className="flex justify-between mt-1 px-1">
                        {MONTHS.map((m, i) => (
                          <span
                            key={m}
                            className={`text-[10px] w-[38px] text-center font-medium ${
                              i === new Date().getMonth() ? 'text-amber-400' : 'text-slate-600'
                            }`}
                          >
                            {m}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-sm bg-sky-400 opacity-80 inline-block" /> Past months
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-sm bg-amber-400 inline-block" /> Current month
                      </span>
                    </div>
                  </div>

                  {/* Occupancy Donut Chart (1/3 width) */}
                  <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col">
                    <div className="mb-4">
                      <h4 className="text-base font-bold text-white flex items-center gap-2">
                        <Bed className="w-4 h-4 text-emerald-400" /> Room Occupancy
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">Live inventory snapshot</p>
                    </div>

                    {/* SVG Donut */}
                    <div className="flex-1 flex items-center justify-center">
                      <div className="relative w-36 h-36">
                        <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                          {/* Background track */}
                          <circle cx="18" cy="18" r="15.9" fill="none"
                            stroke="rgba(255,255,255,0.08)" strokeWidth="4" />
                          {/* Booked arc */}
                          <circle cx="18" cy="18" r="15.9" fill="none"
                            stroke="url(#occupancyGrad)" strokeWidth="4"
                            strokeDasharray={`${occupancyPct} ${100 - occupancyPct}`}
                            strokeLinecap="round"
                          />
                          <defs>
                            <linearGradient id="occupancyGrad" x1="0" y1="0" x2="1" y2="0">
                              <stop offset="0%" stopColor="#10b981" />
                              <stop offset="100%" stopColor="#34d399" />
                            </linearGradient>
                          </defs>
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-2xl font-extrabold text-white">{occupancyPct}%</span>
                          <span className="text-[10px] text-slate-400 font-medium">Occupied</span>
                        </div>
                      </div>
                    </div>

                    {/* Legend */}
                    <div className="space-y-2 mt-4">
                      {[
                        { label: 'Booked Rooms', value: bookedRooms, color: 'bg-emerald-400' },
                        { label: 'Available Rooms', value: availRooms, color: 'bg-slate-600' },
                        { label: 'Total Inventory', value: totalRooms, color: 'bg-sky-400' },
                      ].map((row) => (
                        <div key={row.label} className="flex items-center justify-between text-xs">
                          <span className="flex items-center gap-2 text-slate-400">
                            <span className={`w-2 h-2 rounded-full ${row.color}`} />
                            {row.label}
                          </span>
                          <span className="text-white font-semibold">{row.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Rooms Management */}
          <div className="glass-panel p-8 rounded-3xl border border-slate-800 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-white">Room Categories in {selectedHotel.name}</h3>
                <p className="text-xs text-slate-400 mt-0.5">Manage room base rates, capacity, and total inventory counts.</p>
              </div>
              <button
                onClick={() => setShowCreateRoom(true)}
                className="px-4 py-2 rounded-xl bg-sky-500/10 border border-sky-500/30 text-sky-400 hover:bg-sky-500/20 text-xs font-semibold flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> Add Room Category
              </button>
            </div>

            {/* Create Room Form Modal */}
            {showCreateRoom && (
              <form onSubmit={handleCreateRoom} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                  <select
                    required
                    value={roomType}
                    onChange={(e) => setRoomType(e.target.value)}
                    className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm cursor-pointer focus:outline-none focus:border-sky-500"
                  >
                    <option value="" disabled>Select Room Type</option>
                    <option value="Deluxe Suite">Deluxe Suite</option>
                    <option value="Executive Suite">Executive Suite</option>
                    <option value="Superior Room">Superior Room</option>
                    <option value="Family Suite">Family Suite</option>
                    <option value="Standard Room">Standard Room</option>
                  </select>
                  <input
                    type="number"
                    required
                    placeholder="Base Price ₹"
                    value={roomBasePrice}
                    onChange={(e) => setRoomBasePrice(e.target.value)}
                    className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm"
                  />
                  <input
                    type="number"
                    required
                    placeholder="Total Count"
                    value={roomTotalCount}
                    onChange={(e) => setRoomTotalCount(e.target.value)}
                    className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm"
                  />
                  <input
                    type="number"
                    required
                    placeholder="Capacity"
                    value={roomCapacity}
                    onChange={(e) => setRoomCapacity(e.target.value)}
                    className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm"
                  />
                  <label className="cursor-pointer px-3.5 py-2 rounded-xl bg-sky-500/10 border border-sky-500/30 text-sky-300 hover:bg-sky-500/20 text-xs font-semibold flex items-center justify-center gap-1.5 truncate">
                    <Plus className="w-4 h-4 text-sky-400" />
                    <span>{roomPhotos.length > 0 ? `✅ ${roomPhotos.length} Photo(s) Attached` : '📷 Select JPG Photos'}</span>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const files = Array.from(e.target.files);
                        if (!files.length) return;
                        files.forEach((file) => {
                          compressImageFile(file, (compressedUri) => {
                            setRoomPhotos((prev) => [...prev, compressedUri]);
                          });
                        });
                      }}
                    />
                  </label>
                </div>

                {/* Multiple Room Photos Preview Thumbnails */}
                {roomPhotos.length > 0 && (
                  <div className="pt-2 border-t border-slate-900 flex flex-wrap gap-2 items-center">
                    <span className="text-[11px] text-slate-400 font-medium mr-2">Attached Previews:</span>
                    {roomPhotos.map((photoSrc, idx) => (
                      <div key={idx} className="relative group/pimg w-10 h-10 rounded-lg overflow-hidden border border-slate-800 bg-slate-900">
                        <img src={photoSrc} alt="Preview" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setRoomPhotos((prev) => prev.filter((_, i) => i !== idx))}
                          className="absolute inset-0 bg-rose-950/80 text-rose-300 opacity-0 group-hover/pimg:opacity-100 flex items-center justify-center transition-opacity text-xs"
                          title="Remove photo"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex justify-end gap-2 pt-2">
                  <button type="button" onClick={() => setShowCreateRoom(false)} className="text-xs text-slate-400">Cancel</button>
                  <button type="submit" className="px-4 py-1.5 rounded-lg bg-sky-500 text-white text-xs font-semibold">Save Room</button>
                </div>
              </form>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {rooms.map((r) => (
                <div key={r.id} className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-white text-base">{r.type}</h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Base: <strong className="text-white">₹{r.basePrice}</strong> | Total: <strong className="text-white">{r.totalCount} rooms</strong> | Max: <strong className="text-white">{r.capacity} guests/room</strong>
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <label className="cursor-pointer px-2.5 py-1 rounded-lg bg-sky-500/10 border border-sky-500/30 text-sky-400 hover:bg-sky-500/20 text-[11px] font-semibold inline-flex items-center gap-1">
                        <Plus className="w-3 h-3" /> Upload Photo
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleUploadRoomPhoto(r.id, e)}
                        />
                      </label>
                      <button
                        onClick={() => handleLoadInventory(r)}
                        className="px-3 py-1 rounded-xl bg-slate-900 border border-slate-700 text-xs text-amber-400 font-medium hover:bg-slate-800"
                      >
                        Adjust Surge
                      </button>
                      <button
                        onClick={() => handleDeleteRoom(r.id, r.type)}
                        className="p-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-rose-400 hover:border-rose-500/40 hover:bg-rose-500/10 transition-colors"
                        title="Delete Room Category"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Room Photos Thumbnail List */}
                  {r.photos && r.photos.length > 0 && (
                    <div className="pt-2 border-t border-slate-900 flex flex-wrap gap-2">
                      {r.photos.map((photoUrl, pIdx) => (
                        <div key={pIdx} className="relative group/rimg w-12 h-12 rounded-xl overflow-hidden border border-slate-800 bg-slate-900">
                          <img src={photoUrl} alt={r.type} className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => handleDeleteRoomPhoto(r.id, photoUrl)}
                            className="absolute inset-0 bg-rose-950/80 text-rose-300 opacity-0 group-hover/rimg:opacity-100 flex items-center justify-center transition-opacity"
                            title="Delete room photo"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* ═══════════════════════════════════════════════
              🗓️ VISUAL INVENTORY CALENDAR GRID
          ═══════════════════════════════════════════════ */}
          {selectedRoomForInv && (
            <div className="glass-panel p-8 rounded-3xl border border-amber-500/30 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-amber-400" /> Dynamic Pricing Calendar — {selectedRoomForInv.type}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Click any date to adjust custom surge factors or toggle room closures. Automatic algorithms run continuously.
                  </p>
                </div>
                <span className="text-xs bg-amber-500/10 border border-amber-500/30 text-amber-300 px-3 py-1 rounded-full font-semibold">
                  Base Rate: ₹{selectedRoomForInv.basePrice}/night
                </span>
              </div>

              {/* ── Interactive Calendar Month Grid ── */}
              {(() => {
                const today = new Date();
                const todayStr = today.toISOString().split('T')[0];

                // Use navigable month/year from state
                const year = calendarYear;
                const month = calendarMonth;
                const daysInMonth = new Date(year, month + 1, 0).getDate();
                const firstDayIndex = new Date(year, month, 1).getDay();
                const monthName = new Date(year, month, 1).toLocaleString('default', { month: 'long' });
                const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

                // Navigation handlers
                const goPrev = () => {
                  if (month === 0) { setCalendarMonth(11); setCalendarYear(y => y - 1); }
                  else setCalendarMonth(m => m - 1);
                };
                const goNext = () => {
                  if (month === 11) { setCalendarMonth(0); setCalendarYear(y => y + 1); }
                  else setCalendarMonth(m => m + 1);
                };
                const goToday = () => {
                  setCalendarMonth(today.getMonth());
                  setCalendarYear(today.getFullYear());
                };
                const isCurrentMonth = year === today.getFullYear() && month === today.getMonth();

                // 🇮🇳 Indian Public Holidays — matches backend HolidayService
                const indianHolidays = {
                  [`${year}-01-26`]: { name: 'Republic Day', emoji: '🇮🇳' },
                  [`${year}-03-17`]: { name: 'Holi', emoji: '🎨' },
                  [`${year}-04-14`]: { name: 'Ambedkar Jayanti', emoji: '✊' },
                  [`${year}-04-18`]: { name: 'Good Friday', emoji: '✝️' },
                  [`${year}-05-12`]: { name: 'Buddha Purnima', emoji: '☸️' },
                  [`${year}-06-07`]: { name: 'Eid ul-Fitr', emoji: '🌙' },
                  [`${year}-08-15`]: { name: 'Independence Day', emoji: '🇮🇳' },
                  [`${year}-09-05`]: { name: 'Ganesh Chaturthi', emoji: '🐘' },
                  [`${year}-10-02`]: { name: 'Gandhi Jayanti', emoji: '🕊️' },
                  [`${year}-10-20`]: { name: 'Dussehra', emoji: '🏹' },
                  [`${year}-10-28`]: { name: 'Diwali', emoji: '🪔' },
                  [`${year}-11-05`]: { name: 'Guru Nanak Jayanti', emoji: '🙏' },
                  [`${year}-12-25`]: { name: 'Christmas', emoji: '🎄' },
                  [`${year}-01-01`]: { name: 'New Year', emoji: '🎆' },
                };

                return (
                  <div className="space-y-4">
                    {/* ── Month Navigation Header ── */}
                    <div className="flex items-center justify-between">
                      <button
                        type="button"
                        onClick={goPrev}
                        className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                        title="Previous Month"
                      >
                        ‹
                      </button>

                      <div className="flex items-center gap-3">
                        <span className="text-base font-bold text-white">
                          🗓️ {monthName} {year}
                        </span>
                        {!isCurrentMonth && (
                          <button
                            type="button"
                            onClick={goToday}
                            className="text-[10px] px-2 py-1 rounded-lg bg-sky-500/10 border border-sky-500/30 text-sky-400 hover:bg-sky-500/20 transition-colors font-semibold"
                          >
                            Today
                          </button>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={goNext}
                        className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                        title="Next Month"
                      >
                        ›
                      </button>
                    </div>

                    <div className="grid grid-cols-7 gap-2">
                      {/* Day Name Headers */}
                      {dayNames.map((d) => (
                        <div key={d} className="text-center text-xs font-semibold text-slate-400 py-1 uppercase tracking-wider">
                          {d}
                        </div>
                      ))}

                      {/* Empty padding slots before 1st of month */}
                      {Array.from({ length: firstDayIndex }).map((_, i) => (
                        <div key={`empty-${i}`} className="h-16 rounded-xl bg-slate-950/40 border border-slate-900/40" />
                      ))}

                      {/* Actual Month Days */}
                      {Array.from({ length: daysInMonth }).map((_, i) => {
                        const dayNum = i + 1;
                        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
                        const invItem = inventoryList.find((inv) => inv.date === dateStr);
                        const holiday = indianHolidays[dateStr];

                        const isSelected = startDate === dateStr;
                        const isDateClosed = invItem?.closed;
                        const isSurged = invItem?.surgeFactor > 1.0;
                        const isToday = dateStr === todayStr;
                        const calculatedPrice = invItem
                          ? Math.round(selectedRoomForInv.basePrice * (invItem.surgeFactor || 1.0))
                          : selectedRoomForInv.basePrice;

                        return (
                          <div
                            key={dayNum}
                            onClick={() => {
                              setStartDate(dateStr);
                              setEndDate(dateStr);
                              if (invItem) {
                                setSurgeFactor(invItem.surgeFactor || 1.0);
                                setIsClosed(invItem.closed || false);
                              } else {
                                setSurgeFactor(1.0);
                                setIsClosed(false);
                              }
                            }}
                            className={`h-20 p-1.5 rounded-xl border cursor-pointer flex flex-col justify-between transition-all ${
                              isSelected
                                ? 'border-amber-400 bg-amber-500/20 shadow-lg shadow-amber-500/10 scale-105'
                                : isDateClosed
                                ? 'border-rose-900/50 bg-rose-950/30'
                                : holiday
                                ? 'border-purple-500/40 bg-purple-950/20 hover:border-purple-400'
                                : isSurged
                                ? 'border-amber-500/40 bg-amber-950/20 hover:border-amber-400'
                                : isToday
                                ? 'border-sky-500/50 bg-sky-950/20 hover:border-sky-400'
                                : 'border-slate-800 bg-slate-950 hover:border-slate-700'
                            }`}
                          >
                            {/* Top Row: Date + Status Badge */}
                            <div className="flex justify-between items-start">
                              <span className={`text-xs font-bold ${
                                isSelected ? 'text-amber-300'
                                : isToday ? 'text-sky-400'
                                : holiday ? 'text-purple-300'
                                : 'text-slate-300'
                              }`}>
                                {dayNum}
                                {isToday && <span className="ml-0.5 text-[8px] text-sky-400">●</span>}
                              </span>
                              {isDateClosed ? (
                                <span className="text-[8px] bg-rose-500/20 text-rose-300 px-1 rounded font-bold">Closed</span>
                              ) : isSurged ? (
                                <span className="text-[8px] bg-amber-500/20 text-amber-300 px-1 rounded font-bold">⚡{invItem.surgeFactor}x</span>
                              ) : holiday ? (
                                <span className="text-[8px] bg-purple-500/20 text-purple-300 px-1 rounded font-bold">+15%</span>
                              ) : null}
                            </div>

                            {/* Bottom Row: Holiday Name or Price */}
                            <div>
                              {holiday && (
                                <p className="text-[8px] text-purple-300 font-semibold truncate leading-tight">
                                  {holiday.emoji} {holiday.name}
                                </p>
                              )}
                              <p className={`text-xs font-extrabold ${isDateClosed ? 'text-rose-400 line-through' : holiday ? 'text-purple-400' : 'text-emerald-400'}`}>
                                ₹{calculatedPrice.toLocaleString('en-IN')}
                              </p>
                              <p className="text-[8px] text-slate-500 truncate">
                                {invItem ? `${invItem.totalCount - invItem.bookedCount}/${invItem.totalCount} left` : 'Available'}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}
              {/* ── Color Legend ── */}
              <div className="flex flex-wrap gap-3 text-[10px] text-slate-400 pt-1">
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-sky-950 border border-sky-500/50 inline-block"/> Today</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-purple-950 border border-purple-500/40 inline-block"/> Holiday (+15% auto)</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-amber-950 border border-amber-500/40 inline-block"/> Manual Surge</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-rose-950 border border-rose-900/50 inline-block"/> Closed</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-slate-950 border border-slate-800 inline-block"/> Normal</span>
              </div>

              {/* ── Adjustment Form Panel for Selected Date ── */}
              <div className="pt-4 border-t border-slate-800">
                <form onSubmit={handleUpdateInventory} className="glass-panel p-6 rounded-2xl border border-slate-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Start Date</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">End Date</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Manual Surge Rate — <span className="text-amber-400 font-mono">{surgeFactor}x</span>
                      <span className="text-slate-500 font-normal ml-1">(Normal: 1.0 · Max: 1.5)</span>
                    </label>
                    <input
                      type="range"
                      min="1.0"
                      max="1.5"
                      step="0.05"
                      value={surgeFactor}
                      onChange={(e) => setSurgeFactor(e.target.value)}
                      className="w-full accent-amber-500 h-2 rounded-lg cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                      <span>1.0x (Normal)</span>
                      <span>1.25x (Festival)</span>
                      <span>1.5x (Max)</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isClosed}
                        onChange={(e) => setIsClosed(e.target.checked)}
                        className="w-4 h-4 accent-amber-500 rounded"
                      />
                      Mark Closed
                    </label>
                    <button type="submit" className="gradient-btn px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0">
                      <Sparkles className="w-3.5 h-3.5 text-amber-200" /> Apply Rates
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ManagerDashboard;
