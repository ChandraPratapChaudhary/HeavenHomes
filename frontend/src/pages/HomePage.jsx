import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import HotelCard from '../components/HotelCard';
import {
  Search, MapPin, Calendar as CalendarIcon, Users, Sparkles,
  Building2, ShieldCheck, Zap, Award, Filter,
  SlidersHorizontal, X, ChevronDown, Star
} from 'lucide-react';



const AMENITY_OPTIONS = [
  { id: 'WIFI', label: 'Free WiFi', icon: '📶' },
  { id: 'POOL', label: 'Swimming Pool', icon: '🏊' },
  { id: 'AC', label: 'Air Conditioning', icon: '❄️' },
  { id: 'BREAKFAST', label: 'Free Breakfast', icon: '🍳' },
  { id: 'GYM', label: 'Gym / Fitness', icon: '🏋️' },
  { id: 'PARKING', label: 'Free Parking', icon: '🅿️' },
  { id: 'SPA', label: 'Spa & Wellness', icon: '💆' },
  { id: 'RESTAURANT', label: 'Restaurant', icon: '🍽️' },
  { id: 'TV', label: 'Smart TV', icon: '📺' },
  { id: 'ROOM_SERVICE', label: 'Room Service', icon: '🛎️' },
];

const SORT_OPTIONS = [
  { value: 'default', label: 'Recommended' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating_desc', label: 'Top Rated First' },
];

const PriceSlider = ({ min, max, value, onChange }) => {
  const handleMin = (e) => onChange([Number(e.target.value), value[1]]);
  const handleMax = (e) => onChange([value[0], Number(e.target.value)]);
  const pctLow = ((value[0] - min) / (max - min)) * 100;
  const pctHigh = ((value[1] - min) / (max - min)) * 100;

  return (
    <div className="space-y-3">
      <div className="flex justify-between text-xs text-gray-400">
        <span>₹{value[0].toLocaleString('en-IN')}</span>
        <span>₹{value[1].toLocaleString('en-IN')}</span>
      </div>
      <div className="relative h-2 mt-1">
        <div className="absolute inset-0 bg-white/10 rounded-full" />
        <div
          className="absolute h-2 bg-gradient-to-r from-sky-500 to-blue-500 rounded-full"
          style={{ left: `${pctLow}%`, right: `${100 - pctHigh}%` }}
        />
        <input
          type="range" min={min} max={max} step={500}
          value={value[0]}
          onChange={handleMin}
          className="absolute w-full appearance-none bg-transparent h-2 cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-sky-400 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-lg"
        />
        <input
          type="range" min={min} max={max} step={500}
          value={value[1]}
          onChange={handleMax}
          className="absolute w-full appearance-none bg-transparent h-2 cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-blue-400 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-lg"
        />
      </div>
    </div>
  );
};

const HomePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [city, setCity] = useState(searchParams.get('city') || 'Mumbai');
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

  const [startDate, setStartDate] = useState(searchParams.get('startDate') || todayStr);
  const [endDate, setEndDate] = useState(searchParams.get('endDate') || tomorrowStr);
  const [roomsCount, setRoomsCount] = useState(Number(searchParams.get('roomsCount')) || 1);

  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');


  // ── Filter panel state
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState([500, 25000]);
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [sortBy, setSortBy] = useState('default');
  const [popularCities, setPopularCities] = useState([
    { name: 'Mumbai' }, { name: 'Delhi' }, { name: 'Goa' }, { name: 'Bengaluru' },
    { name: 'Jaipur' }, { name: 'Udaipur' },
  ]);

  const fetchCities = async () => {
    try {
      const res = await api.get('/hotels/cities');
      const citiesList = res.data.data || res.data || [];
      if (Array.isArray(citiesList) && citiesList.length > 0) {
        setPopularCities(citiesList.map((c) => ({ name: c })));
      }
    } catch (err) {
      console.warn('Could not fetch dynamic cities from DB, using fallback list');
    }
  };

  const fetchHotels = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/hotels/search', {
        params: { city, startDate, endDate, roomsCount, page: 0, size: 50 },
      });
      const data = response.data.data
        ? response.data.data.content
        : response.data.content || [];
      setHotels(data);
    } catch (err) {
      setError('Could not load hotels. Please try again.');
      setHotels([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    fetchCities();
    fetchHotels(); 
  }, []);

  // ── Client-side Filtering + Sorting
  const filteredHotels = useMemo(() => {
    let result = [...hotels];

    // Price filter — API field is `price` (not cheapestPrice)
    result = result.filter((h) => {
      const price = h.price || h.cheapestPrice;
      if (price == null) return true; // no price data → always show
      return price >= priceRange[0] && price <= priceRange[1];
    });

    // Amenity filter
    if (selectedAmenities.length > 0) {
      result = result.filter((h) => {
        const hotelAmenities = h.amenities || [];
        return selectedAmenities.every((a) => hotelAmenities.includes(a));
      });
    }

    // Sorting
    const getPrice = (h) => h.price || h.cheapestPrice || 0;
    if (sortBy === 'price_asc') result.sort((a, b) => getPrice(a) - getPrice(b));
    else if (sortBy === 'price_desc') result.sort((a, b) => getPrice(b) - getPrice(a));

    return result;
  }, [hotels, priceRange, selectedAmenities, sortBy]);

  const activeFilterCount = selectedAmenities.length + (priceRange[0] > 500 || priceRange[1] < 25000 ? 1 : 0);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearchParams({ city, startDate, endDate, roomsCount });
    fetchHotels();
  };

  const handleCitySelect = (cityName) => {
    setCity(cityName);
  };

  const toggleAmenity = (id) => {
    setSelectedAmenities((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  };

  const clearFilters = () => {
    setPriceRange([500, 25000]);
    setSelectedAmenities([]);
    setSortBy('default');
  };



  return (
    <div className="space-y-12 pb-16">
      {/* ─── Hero + Search Section ─── */}
      <section className="relative pt-12 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-sky-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-semibold uppercase tracking-wider mb-6 animate-pulse">
          <Sparkles className="w-4 h-4" />
          <span>Next-Gen Luxury Hospitality Platform</span>
        </div>
        <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-tight max-w-4xl mx-auto">
          Find &amp; Book Your <span className="gradient-text">Heavenly Escape</span>
        </h1>
        <p className="mt-4 text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Real-time dynamic pricing, instant availability verification, and seamless Razorpay checkouts.
        </p>

        {/* Modern Minimal Search Engine Bar */}
        <div className="mt-8 max-w-4xl mx-auto relative z-10">
          <form
            onSubmit={handleSearchSubmit}
            className="glass-panel p-2.5 sm:p-3 rounded-2xl sm:rounded-full border border-slate-700/80 shadow-2xl flex flex-col sm:flex-row items-stretch sm:items-center gap-2"
          >
            {/* City Input */}
            <div className="flex-1 px-4 py-1.5 flex flex-col justify-center border-b sm:border-b-0 sm:border-r border-slate-800">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider text-left">Destination</label>
              <div className="flex items-center gap-2 mt-0.5">
                <MapPin className="w-4 h-4 text-sky-400 shrink-0" />
                <input
                  type="text" required placeholder="Where are you going?" value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full bg-transparent text-white placeholder-slate-500 focus:outline-none text-sm font-semibold"
                />
              </div>
            </div>

            {/* Check-In Date */}
            <div className="w-full sm:w-40 px-4 py-1.5 flex flex-col justify-center border-b sm:border-b-0 sm:border-r border-slate-800">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider text-left">Check-In</label>
              <div className="flex items-center gap-1.5 mt-0.5">
                <CalendarIcon className="w-4 h-4 text-sky-400 shrink-0" />
                <input
                  type="date" required value={startDate} min={todayStr}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-transparent text-white focus:outline-none text-xs font-medium cursor-pointer"
                />
              </div>
            </div>

            {/* Check-Out Date */}
            <div className="w-full sm:w-40 px-4 py-1.5 flex flex-col justify-center border-b sm:border-b-0 sm:border-r border-slate-800">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider text-left">Check-Out</label>
              <div className="flex items-center gap-1.5 mt-0.5">
                <CalendarIcon className="w-4 h-4 text-sky-400 shrink-0" />
                <input
                  type="date" required value={endDate} min={startDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full bg-transparent text-white focus:outline-none text-xs font-medium cursor-pointer"
                />
              </div>
            </div>

            {/* Rooms Selector */}
            <div className="w-full sm:w-32 px-4 py-1.5 flex flex-col justify-center">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider text-left">Rooms</label>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Users className="w-4 h-4 text-sky-400 shrink-0" />
                <select
                  value={roomsCount}
                  onChange={(e) => setRoomsCount(Number(e.target.value))}
                  className="w-full bg-transparent text-white focus:outline-none text-xs font-medium cursor-pointer bg-slate-900"
                >
                  {[1, 2, 3, 4, 5].map((num) => (
                    <option key={num} value={num} className="bg-slate-900 text-white">{num} {num === 1 ? 'Room' : 'Rooms'}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Search Button */}
            <button
              type="submit" disabled={loading}
              className="gradient-btn px-6 py-3 rounded-xl sm:rounded-full flex items-center justify-center gap-2 font-bold text-sm shrink-0 shadow-lg shadow-sky-500/25"
            >
              <Search className="w-4 h-4" />
              <span>Search</span>
            </button>
          </form>

          {/* Quick City Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-5">
            <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Popular:
            </span>
            {popularCities.map((item) => (
              <button
                key={item.name} type="button"
                onClick={() => handleCitySelect(item.name)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                  city.toLowerCase() === item.name.toLowerCase()
                    ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/20'
                    : 'bg-slate-900 border border-slate-800 text-slate-300 hover:border-sky-500/50'
                }`}
              >
                {item.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Results Section ─── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Toolbar: Heading + Filter + Sort + View Toggle */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white">
              Hotels in <span className="gradient-text">{city}</span>
            </h2>
            <p className="text-sm text-slate-400 mt-0.5">
              {filteredHotels.length} of {hotels.length} properties · {startDate} → {endDate} · {roomsCount} room
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Sort Dropdown */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none bg-slate-900 border border-slate-700 text-slate-300 text-sm rounded-xl px-4 py-2.5 pr-8 focus:outline-none focus:border-sky-500 cursor-pointer"
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-3 pointer-events-none" />
            </div>

            {/* Filter Toggle Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                showFilters || activeFilterCount > 0
                  ? 'bg-sky-500/10 border-sky-500/50 text-sky-400'
                  : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-600'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
              {activeFilterCount > 0 && (
                <span className="bg-sky-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                  {activeFilterCount}
                </span>
              )}
            </button>

          </div>
        </div>

        {/* ─── Expanded Filter Panel ─── */}
        {showFilters && (
          <div className="mb-6 bg-slate-900/80 backdrop-blur-sm border border-slate-700/60 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-white flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-sky-400" /> Filter Options
              </h3>
              <button
                onClick={clearFilters}
                className="text-xs text-slate-400 hover:text-rose-400 flex items-center gap-1 transition-colors"
              >
                <X className="w-3.5 h-3.5" /> Clear All
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Price Range Slider */}
              <div>
                <p className="text-sm font-semibold text-slate-300 mb-4">Price per Night (₹)</p>
                <PriceSlider min={500} max={25000} value={priceRange} onChange={setPriceRange} />
              </div>

              {/* Amenities Checkboxes */}
              <div>
                <p className="text-sm font-semibold text-slate-300 mb-4">Amenities</p>
                <div className="grid grid-cols-2 gap-2">
                  {AMENITY_OPTIONS.map((a) => (
                    <label
                      key={a.id}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer transition-colors border ${
                        selectedAmenities.includes(a.id)
                          ? 'bg-sky-500/15 border-sky-500/40 text-sky-300'
                          : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:border-slate-600'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedAmenities.includes(a.id)}
                        onChange={() => toggleAmenity(a.id)}
                        className="sr-only"
                      />
                      <span className="text-base leading-none">{a.icon}</span>
                      <span className="text-xs font-medium">{a.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─── Error State ─── */}
        {error && (
          <div className="p-6 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-center mb-6">
            {error}
          </div>
        )}

        {/* ─── Loading Skeletons ─── */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="glass-card rounded-3xl h-96 animate-pulse p-6 flex flex-col justify-between">
                <div className="w-full h-48 bg-slate-800/60 rounded-2xl" />
                <div className="space-y-3">
                  <div className="w-3/4 h-6 bg-slate-800/60 rounded-lg" />
                  <div className="w-1/2 h-4 bg-slate-800/60 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredHotels.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredHotels.map((hotel) => (
              <HotelCard
                key={hotel.id || hotel.hotelId}
                hotel={hotel}
                startDate={startDate}
                endDate={endDate}
                roomsCount={roomsCount}
              />
            ))}
          </div>
        ) : hotels.length > 0 ? (
          /* Hotels exist but filters eliminated them */
          <div className="glass-panel p-10 rounded-3xl text-center space-y-4 max-w-xl mx-auto">
            <SlidersHorizontal className="w-12 h-12 text-slate-600 mx-auto" />
            <h3 className="text-xl font-bold text-white">No hotels match your filters</h3>
            <p className="text-sm text-slate-400">Try relaxing price range or removing some amenity filters.</p>
            <button
              onClick={clearFilters}
              className="mt-2 px-6 py-2.5 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-sm font-semibold transition-colors"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          /* No hotels in city */
          <div className="glass-panel p-12 rounded-3xl text-center space-y-4 max-w-xl mx-auto">
            <Building2 className="w-12 h-12 text-slate-600 mx-auto" />
            <h3 className="text-xl font-bold text-white">No Hotels Found in {city}</h3>
            <p className="text-sm text-slate-400">
              Try another destination:{' '}
              {['Mumbai', 'Delhi', 'Goa'].map((c, i) => (
                <span key={c}>
                  <button onClick={() => { setCity(c); }} className="text-sky-400 underline">{c}</button>
                  {i < 2 ? ', ' : ''}
                </span>
              ))}
            </p>
          </div>
        )}
      </section>

      {/* ─── Feature Highlights Grid ─── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="glass-card p-8 rounded-3xl border border-slate-800/80 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-sky-500/10 text-sky-400 flex items-center justify-center">
              <Zap className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold text-white">Dynamic Pricing Engine</h4>
            <p className="text-sm text-slate-400 leading-relaxed">
              Surge, urgency, occupancy, and holiday strategies automatically calculate live competitive room rates.
            </p>
          </div>
          <div className="glass-card p-8 rounded-3xl border border-slate-800/80 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold text-white">Instant Razorpay Verification</h4>
            <p className="text-sm text-slate-400 leading-relaxed">
              Seamless client-side signature verification + webhook support ensures 100% reliable booking confirmation.
            </p>
          </div>
          <div className="glass-card p-8 rounded-3xl border border-slate-800/80 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <Star className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold text-white">Verified Guest Reviews</h4>
            <p className="text-sm text-slate-400 leading-relaxed">
              Real guest star ratings and reviews with dynamic averages help you make informed booking decisions.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
