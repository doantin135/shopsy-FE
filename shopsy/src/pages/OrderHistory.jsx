import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { orderApi, reviewApi } from "../api/index";
import ReviewModal from "../components/ReviewModal/ReviewModal";

const statusMap = {
  pending: {
    label: "Chờ xác nhận",
    color: "bg-yellow-100 text-yellow-600",
    dot: "bg-yellow-400",
  },
  processing: {
    label: "Đang xử lý",
    color: "bg-blue-100 text-blue-600",
    dot: "bg-blue-400",
  },
  shipped: {
    label: "Đang giao",
    color: "bg-purple-100 text-purple-600",
    dot: "bg-purple-400",
  },
  delivered: {
    label: "Đã giao",
    color: "bg-green-100 text-green-600",
    dot: "bg-green-400",
  },
  cancelled: {
    label: "Đã hủy",
    color: "bg-red-100 text-red-600",
    dot: "bg-red-400",
  },
};

const paymentMap = {
  cod: "💵 COD",
  bank: "🏦 Chuyển khoản",
};

const OrderHistory = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState(null);
  const [reviewModal, setReviewModal] = useState(null);
  const [reviewedItems, setReviewedItems] = useState({});
  const [successMsg, setSuccessMsg] = useState("");

  const handleExpand = async (order) => {
    const newId = expanded === order.id ? null : order.id;
    setExpanded(newId);

    // Kiểm tra từng sản phẩm đã review chưa
    if (newId && order.status === "delivered") {
      const checks = await Promise.all(
        order.items.map((item) =>
          reviewApi
            .check({
              product_id: item.product_id,
              order_id: order.id,
              firebase_uid: user.uid,
            })
            .then((res) => ({
              key: `${order.id}_${item.product_id}`,
              reviewed: res.data.reviewed,
            })),
        ),
      );
      const map = {};
      checks.forEach((c) => {
        map[c.key] = c.reviewed;
      });
      setReviewedItems((prev) => ({ ...prev, ...map }));
    }
  };

  useEffect(() => {
    // Chưa đăng nhập → về login
    if (!user) {
      navigate("/login");
      return;
    }

    orderApi
      .getByUser(user.uid)
      .then((res) => {
        setOrders(res.data.data);
        setLoading(false);
      })
      .catch(() => {
        setError("Không thể tải đơn hàng. Vui lòng thử lại.");
        setLoading(false);
      });
  }, [user, navigate]);

  // ── Loading ──
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 text-sm">Đang tải đơn hàng...</p>
        </div>
      </div>
    );
  }

  // ── Error ──
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-primary text-white px-6 py-2 rounded-full hover:opacity-90 transition"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 dark:text-white py-10">
      <div className="container max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Đơn hàng của tôi</h1>
            <p className="text-gray-500 text-sm mt-1">
              {orders.length} đơn hàng
            </p>
          </div>
          <Link
            to="/"
            className="text-sm text-primary border border-primary px-4 py-2 rounded-full hover:bg-primary hover:text-white transition"
          >
            Tiếp tục mua sắm
          </Link>
        </div>

        {/* ── Chưa có đơn hàng ── */}
        {orders.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-xl font-bold text-gray-500 mb-2">
              Chưa có đơn hàng nào
            </h3>
            <p className="text-gray-400 mb-6">Hãy mua sắm và đặt hàng ngay!</p>
            <Link
              to="/"
              className="bg-gradient-to-r from-primary to-secondary text-white px-8 py-3 rounded-full font-medium hover:opacity-90 transition"
            >
              Mua sắm ngay
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden"
              >
                {/* ── Header đơn hàng ── */}
                <div
                  className="flex items-center justify-between p-5 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                  onClick={() => handleExpand(order)}
                >
                  <div className="flex items-center gap-4">
                    {/* Order ID */}
                    <div>
                      <p className="font-bold text-base">Đơn #{order.id}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {new Date(order.created_at).toLocaleDateString(
                          "vi-VN",
                          {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          },
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {/* Tổng tiền */}
                    <p className="font-bold text-primary text-lg hidden sm:block">
                      {Number(order.total).toLocaleString("vi-VN")}đ
                    </p>

                    {/* Status badge */}
                    <span
                      className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full ${statusMap[order.status]?.color}`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${statusMap[order.status]?.dot}`}
                      />
                      {statusMap[order.status]?.label}
                    </span>

                    {/* Arrow */}
                    <span
                      className={`text-gray-400 transition-transform duration-200 ${expanded === order.id ? "rotate-180" : ""}`}
                    >
                      ▼
                    </span>
                  </div>
                </div>

                {/* ── Chi tiết đơn hàng (accordion) ── */}
                {expanded === order.id && (
                  <div className="border-t border-gray-100 dark:border-gray-700 p-5 space-y-5">
                    {/* Thông tin giao hàng */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 space-y-1.5">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                          Thông tin giao hàng
                        </p>
                        <p className="text-sm">
                          <span className="font-medium">Người nhận:</span>{" "}
                          {order.name}
                        </p>
                        <p className="text-sm">
                          <span className="font-medium">SĐT:</span>{" "}
                          {order.phone}
                        </p>
                        <p className="text-sm">
                          <span className="font-medium">Email:</span>{" "}
                          {order.email}
                        </p>
                        <p className="text-sm">
                          <span className="font-medium">Địa chỉ:</span>{" "}
                          {order.address}
                        </p>
                        {order.note && (
                          <p className="text-sm">
                            <span className="font-medium">Ghi chú:</span>{" "}
                            {order.note}
                          </p>
                        )}
                      </div>

                      <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 space-y-1.5">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                          Thanh toán
                        </p>
                        <p className="text-sm">
                          <span className="font-medium">Phương thức:</span>{" "}
                          {paymentMap[order.payment_method]}
                        </p>
                        <p className="text-sm">
                          <span className="font-medium">Tạm tính:</span>{" "}
                          {Number(order.subtotal).toLocaleString("vi-VN")}đ
                        </p>
                        <p className="text-sm">
                          <span className="font-medium">Phí ship:</span>{" "}
                          {order.shipping_fee == 0 ? (
                            <span className="text-green-500">Miễn phí</span>
                          ) : (
                            `${Number(order.shipping_fee).toLocaleString("vi-VN")}đ`
                          )}
                        </p>
                        <p className="text-sm font-bold text-primary">
                          Tổng: {Number(order.total).toLocaleString("vi-VN")}đ
                        </p>
                      </div>
                    </div>

                    {/* Danh sách sản phẩm */}
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                        Sản phẩm đã đặt ({order.items?.length})
                      </p>
                      <div className="space-y-2">
                        {order.items?.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0"
                          >
                            <div className="flex items-center gap-3">
                              {/* ✅ Hiện ảnh sản phẩm */}
                              {item.product_image ? (
                                <img
                                  src={
                                    item.product_image.startsWith("http")
                                      ? item.product_image
                                      : `http://127.0.0.1:8000/storage/${item.product_image}`
                                  }
                                  alt={item.product_name}
                                  className="w-12 h-12 object-cover rounded-xl flex-shrink-0 border border-gray-100"
                                />
                              ) : (
                                <div className="w-12 h-12 bg-gray-100 dark:bg-gray-600 rounded-xl flex items-center justify-center text-xl flex-shrink-0">
                                  📦
                                </div>
                              )}
                              <div>
                                <p className="text-sm font-medium">
                                  {item.product_name}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {Number(item.price).toLocaleString("vi-VN")}đ
                                  × {item.quantity}
                                </p>
                              </div>
                            </div>
                            <p className="text-sm font-bold text-primary">
                              {Number(item.subtotal).toLocaleString("vi-VN")}đ
                            </p>

                            {order.status === "delivered" &&
                              (reviewedItems[
                                `${order.id}_${item.product_id}`
                              ] ? (
                                <span className="text-xs text-green-500 font-medium flex items-center gap-1">
                                  ✅ Đã đánh giá
                                </span>
                              ) : (
                                <button
                                  onClick={() =>
                                    setReviewModal({
                                      product: item,
                                      orderId: order.id,
                                    })
                                  }
                                  className="text-xs bg-primary/10 text-primary px-3 py-1.5 rounded-full hover:bg-primary hover:text-white transition font-medium"
                                >
                                  ⭐ Đánh giá
                                </button>
                              ))}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Nút xem chi tiết */}
                    <div className="flex justify-end">
                      <Link
                        to={`/order-success/${order.id}`}
                        className="text-sm text-primary border border-primary px-4 py-2 rounded-full hover:bg-primary hover:text-white transition"
                      >
                        Xem chi tiết →
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      {/* Success message */}
      {successMsg && (
        <div className="fixed top-5 right-5 z-50 bg-green-500 text-white px-5 py-3 rounded-xl shadow-lg flex items-center gap-2">
          ✅ {successMsg}
        </div>
      )}

      {/* Review Modal */}
      {reviewModal && (
        <ReviewModal
          product={reviewModal.product}
          orderId={reviewModal.orderId}
          onClose={() => setReviewModal(null)}
          onSuccess={() => {
            // Cập nhật trạng thái đã review
            const key = `${reviewModal.orderId}_${reviewModal.product.product_id}`;
            setReviewedItems((prev) => ({ ...prev, [key]: true }));
            setReviewModal(null);
            setSuccessMsg("Đánh giá thành công! Cảm ơn bạn.");
            setTimeout(() => setSuccessMsg(""), 3000);
          }}
        />
      )}
    </div>
  );
};

export default OrderHistory;
