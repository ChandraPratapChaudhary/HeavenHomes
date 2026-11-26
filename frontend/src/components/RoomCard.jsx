import React from 'react';
import { Users, Bed, Check, Sparkles, Shield, ArrowRight } from 'lucide-react';

const RoomCard = ({ room, onReserve, isReserving }) => {
  const sampleRoomImages = [
    'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=800&q=80',
  ];

  const displayImage =
    room.photos && room.photos.length > 0 && room.photos[0]
      ? room.photos[0]
      : sampleRoomImages[(room.id || 0) % sampleRoomImages.length];

  return (
    <div className="glass-card rounded-2xl p-6 border border-slate-800/80 hover:border-sky-500/40 transition-all flex flex-col md:flex-row gap-6 items-stretch">
      {/* Image */}
      <div className="w-full md:w-64 h-48 rounded-xl overflow-hidden shrink-0 relative bg-slate-900">
        <img src={displayImage} alt={room.type} className="w-full h-full object-cover" />
        <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-lg text-xs font-semibold text-sky-400 border border-slate-700/60">
          {room.capacity || 2} Guests Max
        </div>
      </div>

      {/* Details */}
      <div className="flex-1 flex flex-col justify-between space-y-4">
        <div>
          <div className="flex items-center justify-between">
            <h4 className="text-xl font-bold text-white tracking-tight">{room.type}</h4>
            <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
              Available
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs text-slate-400 mt-2">
            <span className="flex items-center gap-1">
              <Users className="w-4 h-4 text-slate-400" /> Max Capacity: {room.capacity || 2} Persons
            </span>
            <span className="flex items-center gap-1">
              <Bed className="w-4 h-4 text-slate-400" /> King Size Bed
            </span>
          </div>

          <p className="text-sm text-slate-300 mt-3 leading-relaxed">
            Elegantly designed luxury room with modern interiors, climate control, private marble bathroom, premium toiletries, and city view.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-4">
            <div className="flex items-center gap-1.5 text-xs text-slate-300">
              <Check className="w-3.5 h-3.5 text-sky-400" /> 24/7 Room Service
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-300">
              <Check className="w-3.5 h-3.5 text-sky-400" /> Free High-Speed WiFi
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-300">
              <Check className="w-3.5 h-3.5 text-sky-400" /> Air Conditioning
            </div>
          </div>
        </div>

        {/* Pricing & CTA */}
        <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
          <div>
            <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold block">Calculated Price</span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-extrabold text-white">
                ₹{room.price ? Number(room.price).toLocaleString() : Number(room.basePrice || 2999).toLocaleString()}
              </span>
              <span className="text-xs text-slate-400">/ night</span>
            </div>
          </div>

          <button
            onClick={() => onReserve(room)}
            disabled={isReserving}
            className="gradient-btn px-6 py-3 rounded-xl font-semibold text-sm flex items-center gap-2"
          >
            {isReserving ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>Reserve Room</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoomCard;
