import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { 
  Calendar, 
  Building2, 
  MapPin, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  XCircle, 
  ArrowRight,
  RefreshCw
} from 'lucide-react';

const MyBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);
  const navigate = useNavigate();

  const fetchMyBookings = async () => {
    setLoading(true);
    try {
      const response = await api.get('/users/myBookings');
      const data = response.data.data || response.data || [];
      setBookings(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyBookings();
  }, []);

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) {
      return;
    }

    setCancellingId(bookingId);
    try {
      await api.post(`/bookings/${bookingId}/cancel`);
      fetchMyBookings();
    } catch (err) {
      console.error(err);
      alert('Failed to cancel booking.');
    } finally {
      setCancellingId(null);
    }
  };

  const getLocalDateStr = (d = new Date()) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  const todayStr = getLocalDateStr(new Date());

  const getStatusBadge = (b) => {
    const status = b.bookingStatus;
    if (status === 'CANCELLED' || status === 'EXPIRED') {
      return (
        <span className="px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold flex items-center gap-1">
          <XCircle className="w-3.5 h-3.5" /> {status}
        </span>
      );
    }

    if (status === 'CONFIRMED') {
      if (b.checkOutDate < todayStr) {
        return (
          <span className="px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" /> Stay Completed
          </span>
        );
      }
      if (b.checkInDate <= todayStr && todayStr <= b.checkOutDate) {
        return (
          <span className="px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-400 text-xs font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-sky-400" /> Active Stay
          </span>
        );
      }
      return (
        <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-1">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Upcoming Stay
        </span>
      );
    }

    return (
      <span className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold flex items-center gap-1">
        <Clock className="w-3.5 h-3.5" /> {status}
      </span>
    );
  };

  const canCancel = (b) => {
    if (b.bookingStatus !== 'CONFIRMED') return false;
    return b.checkInDate > todayStr;
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">My Bookings History</h1>
          <p className="text-sm text-slate-400 mt-1">Track reservation status, view receipts, or manage cancellations.</p>
        </div>
        <button
          onClick={fetchMyBookings}
          className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
          title="Refresh List"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="glass-card p-6 rounded-3xl h-36 animate-pulse" />
          ))}
        </div>
      ) : bookings.length > 0 ? (
        <div className="space-y-6">
          {bookings.map((b) => (
            <div
              key={b.id}
              className="glass-card p-6 rounded-3xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:border-sky-500/40 transition-all"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono font-bold text-sky-400 bg-sky-500/10 px-2.5 py-1 rounded-lg border border-sky-500/20">
                    #{b.id}
                  </span>
                  {getStatusBadge(b)}
                </div>

                <h3 className="text-xl font-bold text-white tracking-tight">
                  {b.hotelName || 'Heaven Luxury Hotel'} <span className="text-slate-500 text-base font-normal">• {b.roomType || 'Deluxe Room'}</span>
                </h3>

                <p className="text-sm text-slate-400 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-slate-500" />
                  <span>Check-in: <strong className="text-slate-200">{b.checkInDate}</strong></span>
                  <span>➔</span>
                  <span>Check-out: <strong className="text-slate-200">{b.checkOutDate}</strong></span>
                  <span>({b.roomsCount} {b.roomsCount === 1 ? 'room' : 'rooms'})</span>
                </p>
              </div>

              <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 border-slate-800 pt-4 md:pt-0">
                <div className="text-right">
                  <span className="text-xs text-slate-400 block uppercase tracking-wider font-semibold">Total Paid</span>
                  <span className="text-xl font-extrabold text-white">₹{Number(b.amount).toLocaleString()}</span>
                </div>

                <div className="flex items-center gap-2">
                  {canCancel(b) && (
                    <button
                      onClick={() => handleCancelBooking(b.id)}
                      disabled={cancellingId === b.id}
                      className="px-4 py-2 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 hover:bg-rose-500/20 text-xs font-semibold"
                    >
                      {cancellingId === b.id ? 'Cancelling...' : 'Cancel Stay'}
                    </button>
                  )}

                  <button
                    onClick={() => navigate(`/checkout/${b.id}`)}
                    className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
                    title="View Details"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-panel p-12 rounded-3xl text-center space-y-4 max-w-md mx-auto">
          <Calendar className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-xl font-bold text-white">No Bookings Yet</h3>
          <p className="text-sm text-slate-400">You haven't made any hotel reservations yet.</p>
          <button onClick={() => navigate('/')} className="gradient-btn px-6 py-2.5 rounded-xl font-semibold">
            Explore Hotels Now
          </button>
        </div>
      )}
    </div>
  );
};

export default MyBookingsPage;
