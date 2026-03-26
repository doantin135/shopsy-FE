import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  FaStar,
  FaArrowLeft,
  FaShoppingCart,
  FaHeart,
  FaRegHeart,
  FaTruck,
  FaSyncAlt,
  FaCheckCircle,
  FaCommentDots,
} from "react-icons/fa";

import { productApi, reviewApi, orderApi } from "../api/index";
import AOS from "aos";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import ReviewModal from "../components/ReviewModal/ReviewModal";
import { useWishlist } from "../context/WishlistContext";

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

  useEffect(() => {
    AOS.init({ duration: 600 });

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

  useEffect(() => {
    if (id) {
      reviewApi.getByProduct(id).then((res) => {
        setReviews(res.data.data);
        setAvgRating(res.data.average);
        setTotalReviews(res.data.total);
      });
    }
  }, [id]);

  useEffect(() => {
    if (!user || !id) return;

    orderApi.getByUser(user.uid).then(async (res) => {
      const found = res.data.data.find(
        (o) =>
          o.status === "delivered" && o.items?.some((i) => i.product_id == id),
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

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center">
        <div>
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={() => navigate("/")}
            className="bg-primary text-white px-6 py-2 rounded-full"
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
        <div className="flex gap-2 text-sm text-gray-500 mb-8">
          <Link to="/">Trang chủ</Link>
          <span>/</span>
          <span onClick={() => navigate("/")} className="cursor-pointer">
            Sản phẩm
          </span>
          <span>/</span>
          <span className="text-primary">{product.name}</span>
        </div>

        <div className="grid md:grid-cols-2 gap-12">
          <img
            src={getImageUrl(product.image)}
            className="rounded-2xl shadow-xl max-w-md"
            alt={product.name}
          />

          <div className="space-y-5">
            <h1 className="text-3xl font-bold">{product.name}</h1>

            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <FaStar
                  key={s}
                  style={{
                    color: s <= Math.round(avgRating) ? "#ffb800" : "#e5e7eb",
                  }}
                />
              ))}
              <span className="text-sm text-gray-500 ml-2">
                ({totalReviews})
              </span>
            </div>

            <p className="text-3xl font-bold text-primary">
              {Number(product.price).toLocaleString("vi-VN")}đ
            </p>

            <div className="flex items-center gap-3">
              <button onClick={() => setQuantity((q) => Math.max(1, q - 1))}>
                -
              </button>
              <span>{quantity}</span>
              <button onClick={() => setQuantity((q) => q + 1)}>+</button>
            </div>

            <div className="flex gap-3 flex-wrap">
              <button
                onClick={handleAddToCart}
                className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-full"
              >
                <FaShoppingCart />
                {added ? "Đã thêm ✓" : "Thêm giỏ"}
              </button>

              <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 border px-6 py-3 rounded-full"
              >
                <FaArrowLeft />
                Quay lại
              </button>

              <button
                onClick={() => toggleWishlist(product)}
                className="flex items-center gap-2 border px-6 py-3 rounded-full"
              >
                {isWishlisted(product.id) ? <FaHeart /> : <FaRegHeart />}
                Yêu thích
              </button>
            </div>

            {user && deliveredOrder && !alreadyReviewed && (
              <button
                onClick={() =>
                  setReviewModal({
                    product,
                    orderId: deliveredOrder.id,
                  })
                }
                className="bg-yellow-400 text-white px-6 py-3 rounded-full flex items-center gap-2"
              >
                <FaStar />
                Viết đánh giá
              </button>
            )}

            {/* FIXED HERE */}
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <FaTruck /> Miễn phí ship {">"} 500k
              </div>
              <div className="flex items-center gap-2">
                <FaSyncAlt /> Đổi trả 7 ngày
              </div>
              <div className="flex items-center gap-2">
                <FaCheckCircle /> Hàng chính hãng
              </div>
            </div>
          </div>
        </div>

        {/* REVIEWS */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-4">Đánh giá</h2>

          {reviews.length === 0 ? (
            <div className="text-center py-10">
              <FaCommentDots className="text-4xl mx-auto mb-2 text-gray-400" />
              <p>Chưa có đánh giá</p>
            </div>
          ) : (
            reviews.map((r) => (
              <div key={r.id} className="border p-4 rounded-xl mb-2">
                <p>{r.reviewer_name}</p>
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <FaStar
                      key={s}
                      style={{ color: s <= r.rating ? "#ffb800" : "#e5e7eb" }}
                    />
                  ))}
                </div>
                <p className="text-sm text-gray-500">{r.comment}</p>
              </div>
            ))
          )}
        </div>
      </div>

      {successMsg && (
        <div className="fixed top-5 right-5 z-50 bg-green-500 text-white px-5 py-3 rounded-xl shadow-lg flex items-center gap-2">
          <FaCheckCircle />
          {successMsg}
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
            setSuccessMsg("Đánh giá thành công!");
            setTimeout(() => setSuccessMsg(""), 3000);
          }}
        />
      )}
    </div>
  );
};

export default ProductDetail;
