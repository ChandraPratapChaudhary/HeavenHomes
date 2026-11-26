import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Star, Sparkles, ArrowRight, ShieldCheck, Wifi, Coffee, Tv } from 'lucide-react';

const HotelCard = ({ hotel, startDate, endDate, roomsCount }) => {
  const navigate = useNavigate();

  const sampleImages = [
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80',
  ];

  // Pick image from hotel.photos array or fallback to deterministic sample image
  const displayImage =
    hotel.photos && hotel.photos.length > 0 && hotel.photos[0]
      ? hotel.photos[0]
      : sampleImages[(hotel.id || 0) % sampleImages.length];

  const getLocalDateStr = (d = new Date()) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleBookNow = () => {
    const todayStr = getLocalDateStr(new Date());
    const tomorrowObj = new Date();
    tomorrowObj.setDate(tomorrowObj.getDate() + 1);
    const tomorrowStr = getLocalDateStr(tomorrowObj);

    const params = new URLSearchParams({
      startDate: startDate || todayStr,
      endDate: endDate || tomorrowStr,
      roomsCount: roomsCount || 1,
    });
    navigate(`/hotels/${hotel.id}?${params.toString()}`);
  };

  return (
    <div className="glass-card rounded-3xl overflow-hidden group flex flex-col h-full border border-slate-800/80 hover:shadow-2xl hover:shadow-sky-500/10 transition-all duration-300">
      {/* Image Container */}
      <div className="relative h-56 w-full overflow-hidden bg-slate-900">
        <img
          src={displayImage}
          alt={hotel.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

        {/* City Badge */}
        <div className="absolute top-4 left-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-950/80 backdrop-blur-md border border-slate-700/60 text-xs font-medium text-slate-200">
          <MapPin className="w-3.5 h-3.5 text-sky-400" />
          <span>{hotel.city}</span>
        </div>

        {/* Star Rating Badge */}
        <div className="absolute top-4 right-4 flex items-center gap-1 px-3 py-1.5 rounded-full bg-amber-500/20 backdrop-blur-md border border-amber-500/40 text-xs font-bold text-amber-300">
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          <span>4.9 / 5</span>
        </div>

        {/* Price Tag Overlay */}
        <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
          <div>
            <span className="text-xs uppercase tracking-wider text-slate-300 font-semibold block">Starting from</span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-extrabold text-white">₹{hotel.price ? Number(hotel.price).toLocaleString() : '2,499'}</span>
              <span className="text-xs text-slate-400">/ night</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <h3 className="text-xl font-bold text-white group-hover:text-sky-400 transition-colors line-clamp-1">
            {hotel.name}
          </h3>
          <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Verified Luxury Property
          </p>

          {/* Amenities Tags (dynamic from API) */}
          <div className="flex flex-wrap gap-2 mt-4">
            {(hotel.amenities && hotel.amenities.length > 0
              ? hotel.amenities
              : ['WIFI', 'AC']
            ).map((amenity) => {
              const amenityLabels = {
                WIFI: { label: 'WiFi', icon: <Wifi className="w-3 h-3 text-sky-400" /> },
                POOL: { label: 'Pool', icon: <span className="text-xs">🏊</span> },
                AC: { label: 'AC', icon: <span className="text-xs">❄️</span> },
                BREAKFAST: { label: 'Breakfast', icon: <Coffee className="w-3 h-3 text-amber-400" /> },
                GYM: { label: 'Gym', icon: <span className="text-xs">🏋️</span> },
                PARKING: { label: 'Parking', icon: <span className="text-xs">🅿️</span> },
                SPA: { label: 'Spa', icon: <span className="text-xs">💆</span> },
                RESTAURANT: { label: 'Restaurant', icon: <span className="text-xs">🍽️</span> },
                TV: { label: 'Smart TV', icon: <Tv className="w-3 h-3 text-indigo-400" /> },
                ROOM_SERVICE: { label: 'Room Service', icon: <span className="text-xs">🛎️</span> },
              };
              const info = amenityLabels[amenity] || { label: amenity, icon: null };
              return (
                <span key={amenity} className="px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700/50 text-[11px] text-slate-300 flex items-center gap-1">
                  {info.icon} {info.label}
                </span>
              );
            })}
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={handleBookNow}
          className="w-full mt-2 gradient-btn py-3 rounded-xl font-semibold flex items-center justify-center gap-2 group/btn"
        >
          <span>View Rooms & Reserve</span>
          <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
};

export default HotelCard;
