import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { FaStar, FaArrowLeft, FaShoppingCart } from "react-icons/fa";
import { productApi, reviewApi, orderApi } from "../api/index";
import AOS from "aos";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import ReviewModal from "../components/ReviewModal/ReviewModal";
import { useWishlist } from "../context/WishlistContext";
import { FaHeart, FaRegHeart } from "react-icons/fa";

const getImageUrl = (image) => {
  if (!image) return "https://placehold.co/400x500?text=No+Image";
  if (image.startsWith("http")) return image;
  return `http://127.0.0.1:8000/storage/${image}`;
};

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user } = useAuth();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [avgRating, setAvgRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);

  const [reviewModal, setReviewModal] = useState(null);
  const [deliveredOrder, setDeliveredOrder] = useState(null);
  const [alreadyReviewed, setAlreadyReviewed] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const { toggleWishlist, isWishlisted } = useWishlist();

  // Fetch product
  useEffect(() => {
    AOS.init({ duration: 600 });
    setLoading(true);
    productApi
      .getById(id)
      .then((res) => {
        setProduct(res.data.data);
        setLoading(false);
      })
      .catch(() => {
        setError("Không tìm thấy sản phẩm.");
        setLoading(false);
      });
  }, [id]);

  // Fetch reviews
  useEffect(() => {
    if (id) {
      reviewApi.getByProduct(id).then((res) => {
        setReviews(res.data.data);
        setAvgRating(res.data.average);
        setTotalReviews(res.data.total);
      });
    }
  }, [id]);

  // Kiểm tra đơn đã giao
  useEffect(() => {
    if (!user || !id) return;
    orderApi.getByUser(user.uid).then(async (res) => {
      const orders = res.data.data;
      const found = orders.find(
        (o) =>
          o.status === "delivered" &&
          o.items?.some((item) => item.product_id == id),
      );
      if (found) {
        setDeliveredOrder(found);
        const check = await reviewApi.check({
          product_id: id,
          order_id: found.id,
          firebase_uid: user.uid,
        });
        setAlreadyReviewed(check.data.reviewed);
      }
    });
  }, [user, id]);

  const handleAddToCart = () => {
    addToCart(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  // ── Loading ──
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 text-sm">Đang tải sản phẩm...</p>
        </div>
      </div>
    );
  }

  // ── Error ──
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 text-lg mb-4">{error}</p>
          <button
            onClick={() => navigate("/")}
            className="bg-primary text-white px-6 py-2 rounded-full hover:opacity-90 transition"
          >
            Về trang chủ
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 dark:text-white py-10">
      <div className="container">
        {/* Breadcrumb */}
        <div
          data-aos="fade-right"
          className="flex items-center gap-2 text-sm text-gray-500 mb-8"
        >
          <Link to="/" className="hover:text-primary transition">
            Trang chủ
          </Link>
          <span>/</span>
          <span
            className="hover:text-primary transition cursor-pointer"
            onClick={() => navigate("/")}
          >
            Sản phẩm
          </span>
          <span>/</span>
          <span className="text-primary font-medium">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
          {/* ── Ảnh sản phẩm ── */}
          <div data-aos="fade-right" className="flex justify-center">
            <div className="relative">
              <img
                src={getImageUrl(product.image)}
                alt={product.name}
                className="w-full max-w-[420px] h-[480px] object-cover rounded-2xl shadow-xl"
              />
              <div className="absolute top-4 right-4 flex items-center gap-2 bg-white dark:bg-gray-800 px-3 py-1.5 rounded-full shadow-md">
                <span
                  className="w-4 h-4 rounded-full border border-gray-200"
                  style={{ background: product.color }}
                />
                <span className="text-xs font-medium">{product.color}</span>
              </div>
            </div>
          </div>

          {/* ── Thông tin sản phẩm ── */}
          <div data-aos="fade-left" className="flex flex-col gap-5">
            {/* Category */}
            {product.category && (
              <span className="inline-block w-fit bg-primary/10 text-primary text-xs font-semibold px-3 py-1 rounded-full">
                {product.category.label}
              </span>
            )}

            {/* Tên */}
            <h1 className="text-3xl sm:text-4xl font-bold leading-tight">
              {product.name}
            </h1>

            {/* Rating thật từ API */}
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <FaStar
                  key={s}
                  className="text-sm"
                  style={{
                    color: s <= Math.round(avgRating) ? "#ffb800" : "#e5e7eb",
                  }}
                />
              ))}
              <span className="text-sm text-gray-500 ml-2">
                ({totalReviews} đánh giá)
              </span>
            </div>

            {/* Giá */}
            <div className="flex items-center gap-3">
              <span className="text-3xl font-bold text-primary">
                {Number(product.price).toLocaleString("vi-VN")}đ
              </span>
            </div>

            <hr className="border-gray-200 dark:border-gray-700" />

            {/* Màu sắc */}
            <div>
              <p className="text-sm font-semibold mb-2">Màu sắc</p>
              <div className="flex items-center gap-2">
                <span
                  className="w-8 h-8 rounded-full border-2 border-primary shadow-md cursor-pointer"
                  style={{ background: product.color }}
                  title={product.color}
                />
                <span className="text-sm text-gray-500">{product.color}</span>
              </div>
            </div>

            {/* Số lượng */}
            <div>
              <p className="text-sm font-semibold mb-2">Số lượng</p>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-9 h-9 rounded-full border border-gray-300 dark:border-gray-600 flex items-center justify-center text-lg hover:border-primary hover:text-primary transition"
                >
                  −
                </button>
                <span className="w-10 text-center font-semibold text-lg">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="w-9 h-9 rounded-full border border-gray-300 dark:border-gray-600 flex items-center justify-center text-lg hover:border-primary hover:text-primary transition"
                >
                  +
                </button>
              </div>
            </div>

            <div className="flex gap-3 flex-wrap mt-2">
              <button
                onClick={handleAddToCart}
                className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all duration-200 ${
                  added
                    ? "bg-green-500 text-white"
                    : "bg-gradient-to-r from-primary to-secondary text-white hover:scale-105 hover:shadow-lg"
                }`}
              >
                <FaShoppingCart />
                {added ? "Đã thêm vào giỏ ✓" : "Thêm vào giỏ hàng"}
              </button>

              <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 px-6 py-3 rounded-full border border-gray-300 dark:border-gray-600 font-medium hover:border-primary hover:text-primary transition"
              >
                <FaArrowLeft className="text-sm" />
                Quay lại
              </button>

              <button
                onClick={() => toggleWishlist(product)}
                className={`flex items-center gap-2 px-6 py-3 rounded-full border font-medium transition ${
                  isWishlisted(product.id)
                    ? "bg-red-500 text-white border-red-500"
                    : "border-gray-300 dark:border-gray-600 hover:border-red-500 hover:text-red-500"
                }`}
              >
                {isWishlisted(product.id) ? (
                  <>
                    <FaHeart /> Đã yêu thích
                  </>
                ) : (
                  <>
                    <FaRegHeart /> Yêu thích
                  </>
                )}
              </button>
            </div>

            
            {user && deliveredOrder && (
              <div className="mt-2">
                {alreadyReviewed ? (
                  <div className="flex items-center gap-2 text-green-500 text-sm font-medium">
                    ✅ Bạn đã đánh giá sản phẩm này
                  </div>
                ) : (
                  <button
                    onClick={() =>
                      setReviewModal({
                        product: {
                          product_id: product.id,
                          product_name: product.name,
                          product_image: product.image,
                        },
                        orderId: deliveredOrder.id,
                      })
                    }
                    className="flex items-center gap-2 px-6 py-3 rounded-full bg-yellow-400 hover:bg-yellow-500 text-white font-medium transition hover:scale-105"
                  >
                    ⭐ Viết đánh giá
                  </button>
                )}
              </div>
            )}

            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 mt-2 space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                <span>🚚</span> Miễn phí vận chuyển đơn trên 500.000đ
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                <span>🔄</span> Đổi trả trong vòng 7 ngày
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                <span>✅</span> Sản phẩm chính hãng 100%
              </div>
            </div>
          </div>
        </div>

        {/* ── Reviews ── */}
        <div className="mt-12">
          <div className="flex items-center gap-4 mb-6">
            <h2 className="text-2xl font-bold">Đánh giá sản phẩm</h2>
            {totalReviews > 0 && (
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <FaStar
                      key={s}
                      className="text-lg"
                      style={{
                        color:
                          s <= Math.round(avgRating) ? "#ffb800" : "#e5e7eb",
                      }}
                    />
                  ))}
                </div>
                <span className="font-bold text-lg">{avgRating}</span>
                <span className="text-gray-500 text-sm">
                  ({totalReviews} đánh giá)
                </span>
              </div>
            )}
          </div>

          {reviews.length === 0 ? (
            <div className="text-center py-10 bg-gray-50 dark:bg-gray-800 rounded-2xl">
              <p className="text-4xl mb-3">💬</p>
              <p className="text-gray-500">
                Chưa có đánh giá nào. Hãy là người đầu tiên!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div
                  key={review.id}
                  className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-semibold text-sm">
                        {review.reviewer_name}
                      </p>
                      <div className="flex gap-0.5 mt-1">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <FaStar
                            key={s}
                            className="text-sm"
                            style={{
                              color: s <= review.rating ? "#ffb800" : "#e5e7eb",
                            }}
                          />
                        ))}
                      </div>
                    </div>
                    <span className="text-xs text-gray-400">
                      {new Date(review.created_at).toLocaleDateString("vi-VN")}
                    </span>
                  </div>
                  {review.comment && (
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 leading-relaxed">
                      {review.comment}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      
      {successMsg && (
        <div className="fixed top-5 right-5 z-50 bg-green-500 text-white px-5 py-3 rounded-xl shadow-lg">
          oke {successMsg}
        </div>
      )}

      
      {reviewModal && (
        <ReviewModal
          product={reviewModal.product}
          orderId={reviewModal.orderId}
          onClose={() => setReviewModal(null)}
          onSuccess={() => {
            setAlreadyReviewed(true);
            setReviewModal(null);
            setSuccessMsg("Đánh giá thành công! Cảm ơn bạn.");
            setTimeout(() => setSuccessMsg(""), 3000);
            reviewApi.getByProduct(id).then((res) => {
              setReviews(res.data.data);
              setAvgRating(res.data.average);
              setTotalReviews(res.data.total);
            });
          }}
        />
      )}
    </div>
  );
};

export default ProductDetail;
