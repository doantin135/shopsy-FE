import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { orderApi, reviewApi } from "../api/index";
import ReviewModal from "../components/ReviewModal/ReviewModal";

import {
  FaBox,
  FaMoneyBillWave,
  FaUniversity,
  FaStar,
  FaCheckCircle,
  FaChevronDown,
} from "react-icons/fa";

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
  cod: (
    <span className="flex items-center gap-1">
      <FaMoneyBillWave /> COD
    </span>
  ),
  bank: (
    <span className="flex items-center gap-1">
      <FaUniversity /> Chuyển khoản
    </span>
  ),
};

const getImageUrl = (image) => {
  if (!image) return "https://placehold.co/60x60?text=No+Image";
  if (image.startsWith("http")) return image;
  return `http://127.0.0.1:8000/storage/${image}`;
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

  // Loading
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

  // Error
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

        {orders.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl">
            <div className="text-6xl mb-4 flex justify-center text-gray-300">
              <FaBox />
            </div>
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
                {/* Header */}
                <div
                  className="flex items-center justify-between p-5 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                  onClick={() => handleExpand(order)}
                >
                  <div>
                    <p className="font-bold text-base">Đơn #{order.id}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {new Date(order.created_at).toLocaleDateString("vi-VN", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <p className="font-bold text-primary text-lg hidden sm:block">
                      {Number(order.total).toLocaleString("vi-VN")}đ
                    </p>

                    <span
                      className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full ${statusMap[order.status]?.color}`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${statusMap[order.status]?.dot}`}
                      />
                      {statusMap[order.status]?.label}
                    </span>

                    <FaChevronDown
                      className={`text-gray-400 transition-transform duration-200 ${
                        expanded === order.id ? "rotate-180" : ""
                      }`}
                    />
                  </div>
                </div>

                {/* Detail */}
                {expanded === order.id && (
                  <div className="border-t p-5 space-y-5">
                    {/* Info */}
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 space-y-1">
                        <p className="text-xs font-semibold text-gray-500 mb-2">
                          Thông tin giao hàng
                        </p>
                        <p>{order.name}</p>
                        <p>{order.phone}</p>
                        <p>{order.email}</p>
                        <p>{order.address}</p>
                      </div>

                      <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 space-y-1">
                        <p className="text-xs font-semibold text-gray-500 mb-2">
                          Thanh toán
                        </p>
                        <p>{paymentMap[order.payment_method]}</p>
                        <p>
                          Tổng:{" "}
                          <span className="text-primary font-bold">
                            {Number(order.total).toLocaleString("vi-VN")}đ
                          </span>
                        </p>
                      </div>
                    </div>

                    {/* Products */}
                    <div className="space-y-2">
                      {order.items?.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between"
                        >
                          <div className="flex items-center gap-3">
                            {item.product_image ? (
                              <img
                                src={getImageUrl(item.product_image)}
                                className="w-12 h-12 rounded-xl"
                              />
                            ) : (
                              <div className="w-12 h-12 flex items-center justify-center bg-gray-200 rounded-xl">
                                <FaBox />
                              </div>
                            )}
                            <div>
                              <p>{item.product_name}</p>
                              <p className="text-xs text-gray-500">
                                x{item.quantity}
                              </p>
                            </div>
                          </div>

                          {order.status === "delivered" &&
                            (reviewedItems[`${order.id}_${item.product_id}`] ? (
                              <span className="text-green-500 flex items-center gap-1 text-xs">
                                <FaCheckCircle /> Đã đánh giá
                              </span>
                            ) : (
                              <button
                                onClick={() =>
                                  setReviewModal({
                                    product: item,
                                    orderId: order.id,
                                  })
                                }
                                className="text-xs flex items-center gap-1 text-primary"
                              >
                                <FaStar /> Đánh giá
                              </button>
                            ))}
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-end">
                      <Link
                        to={`/order-success/${order.id}`}
                        className="text-sm text-primary"
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

      {/* Toast */}
      {successMsg && (
        <div className="fixed top-5 right-5 bg-green-500 text-white px-4 py-2 rounded-lg flex items-center gap-2">
          <FaCheckCircle />
          {successMsg}
        </div>
      )}

      {/* Modal */}
      {reviewModal && (
        <ReviewModal
          product={reviewModal.product}
          orderId={reviewModal.orderId}
          onClose={() => setReviewModal(null)}
          onSuccess={() => {
            const key = `${reviewModal.orderId}_${reviewModal.product.product_id}`;
            setReviewedItems((prev) => ({ ...prev, [key]: true }));
            setReviewModal(null);
            setSuccessMsg("Đánh giá thành công!");
            setTimeout(() => setSuccessMsg(""), 3000);
          }}
        />
      )}
    </div>
  );
};

export default OrderHistory;
