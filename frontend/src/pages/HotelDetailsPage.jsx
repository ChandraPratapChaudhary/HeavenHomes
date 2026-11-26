import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import RoomCard from '../components/RoomCard';
import { useAuth } from '../context/AuthContext';
import { 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  Star, 
  Calendar, 
  Users, 
  Sparkles, 
  ArrowLeft, 
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import AuthModal from '../components/AuthModal';
import ReviewSection from '../components/ReviewSection';

const HotelDetailsPage = () => {
  const { hotelId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const getLocalDateStr = (d = new Date()) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const todayStr = getLocalDateStr(new Date());
  const tomorrowObj = new Date();
  tomorrowObj.setDate(tomorrowObj.getDate() + 1);
  const tomorrowStr = getLocalDateStr(tomorrowObj);

  const startDate = searchParams.get('startDate') || todayStr;
  const endDate = searchParams.get('endDate') || tomorrowStr;
  const roomsCount = Number(searchParams.get('roomsCount')) || 1;

  const [hotelInfo, setHotelInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reservingRoomId, setReservingRoomId] = useState(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  useEffect(() => {
    const fetchHotelInfo = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await api.get(`/hotels/${hotelId}/info`, {
          params: { startDate, endDate, roomsCount },
        });
        const data = response.data.data || response.data;
        setHotelInfo(data);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch hotel details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (hotelId) fetchHotelInfo();
  }, [hotelId, startDate, endDate, roomsCount]);

  const handleReserveRoom = async (room) => {
    if (!user) {
      setAuthModalOpen(true);
      return;
    }

    setReservingRoomId(room.id);
    try {
      const response = await api.post('/bookings/init', {
        hotelId: Number(hotelId),
        roomId: room.id,
        checkInDate: startDate,
        checkOutDate: endDate,
        roomsCount: Number(roomsCount),
      });

      const bookingData = response.data.data || response.data;
      // Navigate to multi-step checkout page with new reservation
      navigate(`/checkout/${bookingData.id}`);
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.apiError?.message || err.response?.data?.message || 'Room reservation failed. Rooms might be fully booked for these dates.';
      alert(msg);
    } finally {
      setReservingRoomId(null);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="w-12 h-12 border-4 border-sky-500/30 border-t-sky-500 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-400 font-medium">Calculating dynamic room pricing & live availability...</p>
      </div>
    );
  }

  if (error || !hotelInfo) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-400 mx-auto" />
        <h2 className="text-2xl font-bold text-white">Hotel Information Unavailable</h2>
        <p className="text-slate-400">{error || 'Could not load hotel info.'}</p>
        <button onClick={() => navigate('/')} className="gradient-btn px-6 py-2.5 rounded-xl font-semibold inline-flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Return to Search
        </button>
      </div>
    );
  }

  const { hotel, rooms } = hotelInfo;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-colors text-sm font-medium"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Search Results
      </button>

      {/* Hotel Header & Photos */}
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-400 text-xs font-semibold uppercase tracking-wider flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" /> {hotel.city}
              </span>
              <span className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /> 4.9 Superb
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">{hotel.name}</h1>
            <p className="text-sm text-slate-400 mt-1 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> Verified Premium Hotel Property
            </p>
          </div>

          <div className="glass-card px-5 py-3 rounded-2xl border border-slate-800 text-right">
            <span className="text-xs text-slate-400 uppercase tracking-wider block font-semibold">Booking Window</span>
            <span className="text-sm font-bold text-slate-200">
              {startDate} ➔ {endDate} ({roomsCount} Room)
            </span>
          </div>
        </div>

        {/* Photo Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-96 rounded-3xl overflow-hidden">
          <div className="md:col-span-2 h-full bg-slate-900 relative">
            <img
              src={hotel.photos && hotel.photos[0] ? hotel.photos[0] : 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80'}
              alt={hotel.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="grid grid-rows-2 gap-4 h-full">
            <div className="bg-slate-900 relative overflow-hidden">
              <img
                src={hotel.photos && hotel.photos[1] ? hotel.photos[1] : 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80'}
                alt={hotel.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="bg-slate-900 relative overflow-hidden">
              <img
                src={hotel.photos && hotel.photos[2] ? hotel.photos[2] : 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80'}
                alt={hotel.name}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Hotel Description & Available Rooms */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left 2 Cols: Room Selection */}
        <div className="lg:col-span-2 space-y-6">
          <div>
            <h3 className="text-2xl font-bold text-white tracking-tight">Available Room Categories</h3>
            <p className="text-sm text-slate-400 mt-1">
              Select your preferred room to calculate dynamic rates and reserve instantly.
            </p>
          </div>

          {rooms && rooms.length > 0 ? (
            <div className="space-y-6">
              {rooms.map((room) => (
                <RoomCard
                  key={room.id}
                  room={room}
                  onReserve={handleReserveRoom}
                  isReserving={reservingRoomId === room.id}
                />
              ))}
            </div>
          ) : (
            <div className="glass-panel p-8 rounded-2xl text-center space-y-3">
              <AlertCircle className="w-10 h-10 text-amber-400 mx-auto" />
              <h4 className="text-lg font-bold text-white">No Available Rooms For Selected Dates</h4>
              <p className="text-sm text-slate-400">
                Please try modifying your check-in and check-out date range.
              </p>
            </div>
          )}
        </div>

        {/* Right Col: Property Info & Amenities Sidebar */}
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-6">
            <h4 className="text-lg font-bold text-white border-b border-slate-800 pb-3">Hotel Info & Contact</h4>

            {hotel.contactInfo && (
              <div className="space-y-3 text-sm text-slate-300">
                {hotel.contactInfo.address && (
                  <p className="flex items-start gap-2.5">
                    <MapPin className="w-4 h-4 text-sky-400 shrink-0 mt-1" />
                    <span>{hotel.contactInfo.address}</span>
                  </p>
                )}
                {hotel.contactInfo.phoneNumber && (
                  <p className="flex items-center gap-2.5">
                    <Phone className="w-4 h-4 text-sky-400 shrink-0" />
                    <span>{hotel.contactInfo.phoneNumber}</span>
                  </p>
                )}
                {hotel.contactInfo.email && (
                  <p className="flex items-center gap-2.5">
                    <Mail className="w-4 h-4 text-sky-400 shrink-0" />
                    <span>{hotel.contactInfo.email}</span>
                  </p>
                )}
              </div>
            )}

            <div>
              <h5 className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-3">Popular Amenities</h5>
              <div className="flex flex-wrap gap-2">
                {(hotel.amenities || ['WIFI', 'SWIMMING_POOL', 'PARKING', 'AIR_CONDITIONING']).map((amenity) => (
                  <span
                    key={amenity}
                    className="px-3 py-1 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 font-medium"
                  >
                    {amenity.replace('_', ' ')}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ⭐ Guest Reviews Section */}
      <div className="max-w-5xl mx-auto px-4 pb-16">
        <ReviewSection hotelId={hotelId} />
      </div>

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode="login"
      />
    </div>
  );
};

export default HotelDetailsPage;
