import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { 
  CheckCircle2, 
  CreditCard, 
  UserCheck, 
  Plus, 
  ShieldCheck, 
  Calendar, 
  Building2, 
  AlertCircle, 
  ArrowRight,
  Sparkles,
  Lock
} from 'lucide-react';

const BookingCheckoutPage = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [booking, setBooking] = useState(null);
  const [guests, setGuests] = useState([]);
  const [selectedGuestIds, setSelectedGuestIds] = useState([]);
  
  // New Guest Form Modal State
  const [showAddGuest, setShowAddGuest] = useState(false);
  const [newGuestName, setNewGuestName] = useState('');
  const [newGuestPhone, setNewGuestPhone] = useState('');
  const [newGuestGender, setNewGuestGender] = useState('MALE');
  const [newGuestDob, setNewGuestDob] = useState('');

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchBookingAndGuests = async () => {
    setLoading(true);
    setError('');
    try {
      const bookingRes = await api.get(`/bookings/${bookingId}`);
      const bData = bookingRes.data.data || bookingRes.data;
      setBooking(bData);

      let gData = [];
      try {
        const guestsRes = await api.get('/users/guests');
        gData = guestsRes.data.data || guestsRes.data || [];
      } catch (gErr) {
        console.warn('Could not fetch user guests:', gErr);
      }

      // Ensure user profile is available
      let currentUser = user;
      if (!currentUser || !currentUser.name) {
        try {
          const uRes = await api.get('/users/profile');
          currentUser = uRes.data.data || uRes.data;
        } catch (uErr) {
          console.warn('Could not fetch user profile:', uErr);
        }
      }

      // Auto self-guest check: If user exists and has a name, but not in guest list, auto-create self-guest!
      if (currentUser && currentUser.name) {
        const hasSelfGuest = gData.some(
          (g) => g.name && g.name.trim().toLowerCase() === currentUser.name.trim().toLowerCase()
        );
        if (!hasSelfGuest) {
          try {
            const selfRes = await api.post('/users/guests', {
              name: currentUser.name,
              phoneNumber: currentUser.phoneNumber || null,
              gender: currentUser.gender || 'MALE',
              dateOfBirth: (currentUser.dateOfBirth && currentUser.dateOfBirth.trim() !== '') ? currentUser.dateOfBirth : null,
            });
            const createdSelf = selfRes.data.data || selfRes.data;
            if (createdSelf && createdSelf.id) {
              gData = [createdSelf, ...gData];
            }
          } catch (autoErr) {
            console.warn('Auto self guest skipped', autoErr);
          }
        }
      }

      setGuests(gData);

      // Pre-select guest IDs: Prioritize account owner profile (currentUser)
      if (bData.guests && bData.guests.length > 0) {
        setSelectedGuestIds(bData.guests.map((g) => g.id));
      } else if (gData.length > 0) {
        const selfGuestObj = currentUser && currentUser.name
          ? gData.find((g) => g.name && g.name.trim().toLowerCase() === currentUser.name.trim().toLowerCase())
          : null;

        if (selfGuestObj) {
          setSelectedGuestIds([selfGuestObj.id]);
        } else {
          setSelectedGuestIds([gData[0].id]);
        }
      }
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.apiError?.message || err.response?.data?.message || 'Could not load booking details.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (bookingId) fetchBookingAndGuests();
  }, [bookingId]);

  // Add guest to user account
  const handleCreateGuest = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/users/guests', {
        name: newGuestName,
        phoneNumber: newGuestPhone ? `+91 ${newGuestPhone}` : null,
        gender: newGuestGender,
        dateOfBirth: newGuestDob || null,
      });
      const createdGuest = res.data.data || res.data;
      setGuests([...guests, createdGuest]);
      setSelectedGuestIds([...selectedGuestIds, createdGuest.id]);
      setNewGuestName('');
      setNewGuestPhone('');
      setNewGuestDob('');
      setShowAddGuest(false);
    } catch (err) {
      alert('Failed to add guest profile.');
    }
  };

  const toggleGuestSelect = (id) => {
    if (selectedGuestIds.includes(id)) {
      setSelectedGuestIds(selectedGuestIds.filter((gId) => gId !== id));
    } else {
      const capacityPerRoom = booking?.roomCapacity || 2;
      const roomsCount = booking?.roomsCount || 1;
      const maxAllowedGuests = roomsCount * capacityPerRoom;

      if (selectedGuestIds.length >= maxAllowedGuests) {
        alert(`⚠️ Room Capacity Limit Reached!\n\nFor ${roomsCount} ${roomsCount === 1 ? 'room' : 'rooms'} (capacity: ${capacityPerRoom} guests/room), you can select a maximum of ${maxAllowedGuests} guests.`);
        return;
      }
      setSelectedGuestIds([...selectedGuestIds, id]);
    }
  };

  // Step 1: Attach Guests to Booking
  const handleSaveGuests = async () => {
    if (selectedGuestIds.length === 0) {
      alert('Please select at least 1 guest for this booking.');
      return;
    }

    const capacityPerRoom = booking?.roomCapacity || 2;
    const roomsCount = booking?.roomsCount || 1;
    const maxAllowedGuests = roomsCount * capacityPerRoom;

    if (selectedGuestIds.length > maxAllowedGuests) {
      alert(`⚠️ Cannot Proceed!\n\nYou have selected ${selectedGuestIds.length} guests, but 1 room only allows up to ${maxAllowedGuests} guests.`);
      return;
    }

    setActionLoading(true);
    setError('');
    try {
      const res = await api.post(`/bookings/${bookingId}/addGuests`, selectedGuestIds);
      const updatedBooking = res.data.data || res.data;
      setBooking(updatedBooking);
      setSuccess('Guests assigned to booking successfully!');
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.apiError?.message || err.response?.data?.message || 'Failed to attach guests.';
      setError(msg);
    } finally {
      setActionLoading(false);
    }
  };

  // Step 2 & 3: Initiate Razorpay Order & Payment
  const handleProceedToPayment = async () => {
    setActionLoading(true);
    setError('');
    try {
      const res = await api.post(`/bookings/${bookingId}/payments`);
      const initDto = res.data.data || res.data;

      const { orderId, amount, currency, key, keyId, name, description } = initDto;

      // Launch Razorpay Checkout Modal
      const options = {
        key: keyId || key,
        amount: amount,
        currency: currency,
        name: name || 'Heaven-Homes Luxury Booking',
        description: description || `Booking ID #${bookingId}`,
        order_id: orderId,
        handler: async function (response) {
          // Client-side verification path
          try {
            await api.post(`/bookings/${bookingId}/verify-payment`, {
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });
            // Re-fetch booking status
            fetchBookingAndGuests();
          } catch (verifyErr) {
            console.error('Payment verification error:', verifyErr);
            alert('Payment verification failed. Please contact support.');
          }
        },
        theme: {
          color: '#0284c7',
        },
      };

      if (window.Razorpay) {
        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        alert('Razorpay SDK failed to load. Check internet connection.');
      }
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.apiError?.message || err.response?.data?.message || 'Payment initiation failed.';
      setError(msg);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="w-12 h-12 border-4 border-sky-500/30 border-t-sky-500 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-400 font-medium">Loading checkout reservation details...</p>
      </div>
    );
  }

  if (error && !booking) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-400 mx-auto" />
        <h2 className="text-xl font-bold text-white">Booking Not Found</h2>
        <p className="text-slate-400">{error}</p>
        <button onClick={() => navigate('/')} className="gradient-btn px-6 py-2.5 rounded-xl font-semibold">
          Return Home
        </button>
      </div>
    );
  }

  const isConfirmed = booking.bookingStatus === 'CONFIRMED';
  const isGuestsAdded = booking.bookingStatus === 'GUESTS_ADDED' || booking.bookingStatus === 'PAYMENTS_PENDING';

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header Banner */}
      <div className="glass-panel p-8 rounded-3xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
          <span className="text-xs uppercase tracking-wider text-sky-400 font-semibold flex items-center gap-1.5 mb-1">
            <Sparkles className="w-4 h-4" /> Booking Reservation #{booking.id}
          </span>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Complete Your Luxury Stay</h1>
          <p className="text-sm text-slate-400 mt-1">
            Check-in: <strong className="text-slate-200">{booking.checkInDate}</strong> | Check-out: <strong className="text-slate-200">{booking.checkOutDate}</strong> ({booking.roomsCount} Room)
          </p>
        </div>

        {/* Status Badge */}
        <div className="shrink-0 text-center">
          <span
            className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider ${
              isConfirmed
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
            }`}
          >
            {booking.bookingStatus}
          </span>
        </div>
      </div>

      {/* Confirmation Screen View */}
      {isConfirmed ? (
        <div className="glass-panel p-10 rounded-3xl border border-emerald-500/30 text-center space-y-6">
          <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <div className="space-y-2 max-w-md mx-auto">
            <h2 className="text-3xl font-extrabold text-white">Booking Confirmed!</h2>
            <p className="text-sm text-slate-300">
              Your payment of <strong className="text-emerald-400">₹{Number(booking.amount).toLocaleString()}</strong> was verified successfully.
            </p>
            <p className="text-xs text-slate-500 pt-2">
              Payment ID: {booking.paymentId || 'Captured via Razorpay'}
            </p>
          </div>

          <div className="pt-4 flex justify-center gap-4">
            <button
              onClick={() => navigate('/my-bookings')}
              className="gradient-btn px-6 py-3 rounded-xl font-semibold"
            >
              View My Bookings
            </button>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 font-semibold hover:text-white"
            >
              Browse More Hotels
            </button>
          </div>
        </div>
      ) : (
        /* Multi-Step Checkout Flow */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left 2 Cols: Step 1 Guests & Step 2 Payment */}
          <div className="lg:col-span-2 space-y-8">
            {/* Step 1: Assign Guests */}
            <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold text-sm">
                    1
                  </div>
                  <h3 className="text-xl font-bold text-white">Select Booking Guests</h3>
                </div>

                <button
                  type="button"
                  onClick={() => setShowAddGuest(true)}
                  className="px-3.5 py-1.5 rounded-xl bg-sky-500/10 border border-sky-500/30 text-sky-400 hover:bg-sky-500/20 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" /> Add New Guest
                </button>
              </div>

              {/* Guests List Selector */}
              {guests.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {guests.map((guest) => {
                    const isSelected = selectedGuestIds.includes(guest.id);
                    return (
                      <div
                        key={guest.id}
                        onClick={() => toggleGuestSelect(guest.id)}
                        className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                          isSelected
                            ? 'bg-sky-500/10 border-sky-500 text-white'
                            : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <UserCheck className={`w-5 h-5 ${isSelected ? 'text-sky-400' : 'text-slate-600'}`} />
                          <div>
                            <span className="font-semibold text-sm block">{guest.name}</span>
                            <span className="text-xs text-slate-500">{guest.gender || 'Guest'} {guest.phoneNumber ? `• ${guest.phoneNumber}` : ''}</span>
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            e.stopPropagation();
                            toggleGuestSelect(guest.id);
                          }}
                          className="w-4 h-4 accent-sky-500 cursor-pointer"
                        />
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-slate-400">No saved guests found. Add a guest profile below to continue.</p>
              )}

              {/* Add Guest Modal/Form inline */}
              {showAddGuest && (
                <form onSubmit={handleCreateGuest} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                  <h4 className="text-xs font-semibold text-sky-400 uppercase tracking-wider">New Guest Details</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    <input
                      type="text"
                      required
                      placeholder="Guest Full Name"
                      value={newGuestName}
                      onChange={(e) => setNewGuestName(e.target.value)}
                      className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-sky-500"
                    />
                    <div className="relative flex items-center group">
                      <span className="absolute left-3 text-slate-400 font-semibold text-xs select-none group-hover:text-sky-400 group-focus-within:text-sky-400 transition-colors pointer-events-none">
                        +91
                      </span>
                      <input
                        type="tel"
                        maxLength={10}
                        placeholder="9876543210"
                        value={newGuestPhone}
                        onChange={(e) => setNewGuestPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                        className="w-full pl-11 pr-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-sky-500 font-mono tracking-wider"
                      />
                    </div>
                    <select
                      value={newGuestGender}
                      onChange={(e) => setNewGuestGender(e.target.value)}
                      className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-sky-500"
                    >
                      <option value="MALE">Male</option>
                      <option value="FEMALE">Female</option>
                      <option value="OTHER">Other</option>
                    </select>
                    <input
                      type="date"
                      placeholder="Date of Birth"
                      value={newGuestDob}
                      onChange={(e) => setNewGuestDob(e.target.value)}
                      className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-sky-500 text-slate-300"
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAddGuest(false)}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-lg bg-sky-500 text-white text-xs font-semibold"
                    >
                      Save Guest
                    </button>
                  </div>
                </form>
              )}

              {/* Save Guests Button */}
              {booking.bookingStatus === 'RESERVED' && (
                <button
                  onClick={handleSaveGuests}
                  disabled={actionLoading || selectedGuestIds.length === 0}
                  className="w-full gradient-btn py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2"
                >
                  {actionLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Confirm Guests & Proceed to Payment</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Step 2: Razorpay Payment Trigger */}
            {isGuestsAdded && (
              <div className="glass-panel p-6 rounded-3xl border border-sky-500/30 space-y-6">
                <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm">
                    2
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Payment via Razorpay</h3>
                    <p className="text-xs text-slate-400">100% Encrypted & Verified Transaction</p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-6 h-6 text-sky-400" />
                    <div>
                      <span className="font-bold text-white text-base block">Razorpay Payment Gateway</span>
                      <span className="text-xs text-slate-400">Cards, UPI, NetBanking, Wallets</span>
                    </div>
                  </div>
                  <Lock className="w-5 h-5 text-emerald-400" />
                </div>

                <button
                  onClick={handleProceedToPayment}
                  disabled={actionLoading}
                  className="w-full gradient-btn py-3.5 rounded-xl font-bold text-base flex items-center justify-center gap-2"
                >
                  {actionLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Pay ₹{Number(booking.amount).toLocaleString()} Now</span>
                      <ShieldCheck className="w-5 h-5 text-sky-200" />
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Right Col: Price Breakdown & Hotel Card */}
          <div className="space-y-6">
            <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-6">
              <h4 className="text-lg font-bold text-white border-b border-slate-800 pb-3">Price Summary</h4>

              <div className="space-y-3 text-sm text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-400">Hotel Name</span>
                  <span className="font-semibold text-white">{booking.hotelName || booking.hotel?.name || 'Luxury Hotel'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Room Category</span>
                  <span className="font-semibold text-white">{booking.roomType || booking.room?.type || 'Deluxe Room'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Total Rooms</span>
                  <span className="font-semibold text-white">{booking.roomsCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Selected Guests</span>
                  <span className="font-semibold text-white">{selectedGuestIds.length}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold block">Total Amount</span>
                  <span className="text-2xl font-extrabold text-white">₹{Number(booking.amount).toLocaleString()}</span>
                </div>
                <span className="text-xs text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full font-medium border border-emerald-500/20">
                  Taxes Included
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingCheckoutPage;
