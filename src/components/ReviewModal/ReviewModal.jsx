import React, { useState } from "react";
import { FaStar } from "react-icons/fa";
import { reviewApi } from "../../api/index";
import { useAuth } from "../../context/AuthContext";
import PropTypes from "prop-types";

const ReviewModal = ({ product, orderId, onClose, onSuccess }) => {
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) return setError("Vui lòng chọn số sao!");
    setLoading(true);
    setError("");
    try {
      await reviewApi.create({
        product_id: product.product_id,
        order_id: orderId,
        firebase_uid: user.uid,
        reviewer_name: user.displayName || user.email,
        rating,
        comment,
      });
      onSuccess();
    } catch (err) {
      setError(
        err.response?.data?.message || "Đã có lỗi xảy ra. Vui lòng thử lại!",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
    >
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold">Đánh giá sản phẩm</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center hover:bg-gray-200 transition"
          >
            ✕
          </button>
        </div>
        
        <div className="flex items-center gap-3 mb-5 p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
          <span className="text-2xl">📦</span>
          <p className="font-medium text-sm">{product.product_name}</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-5">
            <label className="block text-sm font-medium mb-3">
              Chất lượng sản phẩm <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHover(star)}
                  onMouseLeave={() => setHover(0)}
                  className="transition-transform hover:scale-110"
                >
                  <FaStar
                    className="text-3xl transition-colors"
                    style={{
                      color: star <= (hover || rating) ? "#ffb800" : "#e5e7eb",
                    }}
                  />
                </button>
              ))}
              {rating > 0 && (
                <span className="text-sm text-gray-500 ml-2">
                  {
                    ["", "Rất tệ", "Tệ", "Bình thường", "Tốt", "Xuất sắc"][
                      rating
                    ]
                  }
                </span>
              )}
            </div>
          </div>

          <div className="mb-5">
            <label className="block text-sm font-medium mb-2">Nhận xét</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Chia sẻ cảm nhận của bạn về sản phẩm này..."
              rows={4}
              maxLength={1000}
              className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary transition resize-none"
            />
            <p className="text-xs text-gray-400 text-right mt-1">
              {comment.length}/1000
            </p>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-primary to-secondary text-white py-3 rounded-full font-medium hover:opacity-90 transition disabled:opacity-60"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Đang gửi...
                </span>
              ) : (
                "⭐ Gửi đánh giá"
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 rounded-full border border-gray-300 dark:border-gray-600 text-sm font-medium hover:border-primary hover:text-primary transition"
            >
              Hủy
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

ReviewModal.propTypes = {
  product: PropTypes.object.isRequired,
  orderId: PropTypes.number.isRequired,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired,
};

export default ReviewModal;
