import { useState, useEffect } from 'react';
import { Star, Send, User, Trash2 } from 'lucide-react';
import axios from '../api/axios';
import { useAuth } from '../context/AuthContext';

const StarPicker = ({ value, onChange, readOnly = false }) => {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readOnly}
          onClick={() => !readOnly && onChange(star)}
          onMouseEnter={() => !readOnly && setHovered(star)}
          onMouseLeave={() => !readOnly && setHovered(0)}
          className={`transition-transform ${!readOnly ? 'hover:scale-110 cursor-pointer' : 'cursor-default'}`}
        >
          <Star
            size={readOnly ? 16 : 28}
            className={`transition-colors ${
              star <= (hovered || value)
                ? 'fill-amber-400 text-amber-400'
                : 'text-gray-600'
            }`}
          />
        </button>
      ))}
    </div>
  );
};

const RatingBar = ({ count, total, star }) => {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="w-4 text-gray-400">{star}</span>
      <Star size={12} className="fill-amber-400 text-amber-400" />
      <div className="flex-1 bg-white/10 rounded-full h-2">
        <div
          className="bg-amber-400 h-2 rounded-full transition-all duration-700"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-8 text-right text-gray-400">{pct}%</span>
    </div>
  );
};

export default function ReviewSection({ hotelId }) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [summary, setSummary] = useState({ averageRating: 0, totalReviews: 0 });
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const safeReviews = Array.isArray(reviews) ? reviews : [];

  // Compute distribution counts from reviews
  const distribution = [5, 4, 3, 2, 1].map((s) => ({
    star: s,
    count: safeReviews.filter((r) => r && r.rating === s).length,
  }));

  const fetchData = async () => {
    try {
      const [revRes, sumRes] = await Promise.all([
        axios.get(`/hotels/${hotelId}/reviews`),
        axios.get(`/hotels/${hotelId}/reviews/summary`),
      ]);
      const rData = Array.isArray(revRes.data) ? revRes.data : (revRes.data?.data || []);
      const sData = sumRes.data?.data || sumRes.data || { averageRating: 0, totalReviews: 0 };
      setReviews(rData);
      setSummary(sData);
    } catch (e) {
      console.error('Failed to load reviews', e);
    }
  };

  useEffect(() => { fetchData(); }, [hotelId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) { setError('Please select a star rating.'); return; }
    setSubmitting(true);
    setError('');
    try {
      await axios.post(`/hotels/${hotelId}/reviews`, { rating, comment });
      setSuccess('Your review has been submitted! Thank you.');
      setRating(0);
      setComment('');
      fetchData();
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.error?.message || err.response?.data?.apiError?.message || err.response?.data?.message || err.message || 'Failed to submit review.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (reviewId) => {
    try {
      await axios.delete(`/hotels/${hotelId}/reviews/${reviewId}`);
      fetchData();
    } catch (e) {
      console.error('Delete failed', e);
    }
  };

  const formatDate = (dt) => {
    if (!dt) return '';
    return new Date(dt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const avgRating = summary && summary.averageRating ? Number(summary.averageRating) : 0;
  const totalReviewsCount = summary && summary.totalReviews ? Number(summary.totalReviews) : 0;

  return (
    <section className="mt-12">
      {/* Header */}
      <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
        <Star className="fill-amber-400 text-amber-400" size={24} />
        Guest Reviews
      </h2>

      {/* Rating Summary Card */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 mb-8">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          {/* Big average number */}
          <div className="text-center min-w-[120px]">
            <div className="text-6xl font-black text-white">
              {avgRating.toFixed(1)}
            </div>
            <StarPicker value={Math.round(avgRating)} readOnly />
            <p className="text-gray-400 text-sm mt-1">{totalReviewsCount} reviews</p>
          </div>
          {/* Distribution bars */}
          <div className="flex-1 space-y-2 w-full">
            {distribution.map(({ star, count }) => (
              <RatingBar key={star} star={star} count={count} total={totalReviewsCount} />
            ))}
          </div>
        </div>
      </div>

      {/* Write a Review Form */}
      {user ? (
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 mb-8">
          <h3 className="text-lg font-semibold text-white mb-4">Write Your Review</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <p className="text-gray-400 text-sm mb-2">Your Rating *</p>
              <StarPicker value={rating} onChange={setRating} />
            </div>
            <textarea
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience at this hotel..."
              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-amber-400 resize-none transition-colors"
            />
            {error && <p className="text-red-400 text-sm">{error}</p>}
            {success && <p className="text-emerald-400 text-sm">{success}</p>}
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold px-6 py-3 rounded-xl transition-all disabled:opacity-60"
            >
              <Send size={16} />
              {submitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </form>
        </div>
      ) : (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8 text-center">
          <p className="text-gray-400">Please <span className="text-amber-400 font-semibold">login</span> to write a review.</p>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {safeReviews.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No reviews yet. Be the first to review this hotel!
          </div>
        ) : (
          safeReviews.map((review) => (
            <div key={review.id} className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:border-white/20 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold">
                    {review.reviewerName?.charAt(0)?.toUpperCase() || <User size={16} />}
                  </div>
                  <div>
                    <p className="text-white font-semibold">{review.reviewerName || 'Anonymous'}</p>
                    <p className="text-gray-500 text-xs">{formatDate(review.createdAt)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <StarPicker value={review.rating} readOnly />
                  {user?.email === review.reviewerEmail && (
                    <button
                      onClick={() => handleDelete(review.id)}
                      className="text-gray-600 hover:text-red-400 transition-colors ml-2"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
              {review.comment && (
                <p className="text-gray-300 mt-3 leading-relaxed">{review.comment}</p>
              )}
            </div>
          ))
        )}
      </div>
    </section>
  );
}
