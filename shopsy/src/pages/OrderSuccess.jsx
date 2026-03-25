import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { orderApi } from "../api/index";
import { FaCheckCircle, FaBox, FaTruck, FaHome, FaReceipt } from "react-icons/fa";

const statusMap = {
  pending:    { label: "Chờ xác nhận", color: "text-yellow-500",  bg: "bg-yellow-50",  icon: "⏳" },
  processing: { label: "Đang xử lý",   color: "text-blue-500",    bg: "bg-blue-50",    icon: "⚙️" },
  shipped:    { label: "Đang giao",     color: "text-purple-500",  bg: "bg-purple-50",  icon: "🚚" },
  delivered:  { label: "Đã giao",       color: "text-green-500",   bg: "bg-green-50",   icon: "✅" },
  cancelled:  { label: "Đã hủy",        color: "text-red-500",     bg: "bg-red-50",     icon: "❌" },
};

const getImageUrl = (image) => {
  if (!image) return null;
  if (image.startsWith("http")) return image;
  return `http://127.0.0.1:8000/storage/${image}`;
};

const OrderSuccess = () => {
  const { id }                = useParams();
  const [order, setOrder]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    orderApi.getById(id)
      .then((res) => { setOrder(res.data.data); setLoading(false); })
      .catch(()   => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const sc = statusMap[order?.status] || statusMap.pending;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-white to-secondary/5 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 dark:text-white py-10">
      <div className="container max-w-2xl">

        {/* ── Confetti header ── */}
        <div className="text-center mb-8">
          {/* Icon thành công */}
          <div className="relative inline-flex items-center justify-center mb-4">
            <div className="w-28 h-28 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <FaCheckCircle className="text-6xl text-green-500" />
            </div>
            {/* Vòng trang trí */}
            <div className="absolute inset-0 rounded-full border-4 border-green-200 dark:border-green-800 animate-ping opacity-30" />
          </div>

          <div className="flex justify-center gap-2 text-2xl mb-3">
            🎉 🛍️ 🎊
          </div>

          <h1 className="text-4xl font-bold text-green-500 mb-2">
            Đặt hàng thành công!
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Cảm ơn bạn đã mua hàng tại{" "}
            <span className="font-bold text-primary">Shopsy</span>
          </p>
          <p className="text-gray-400 text-sm mt-1">
            Mã đơn hàng:{" "}
            <span className="font-bold text-primary text-base">#{order?.id}</span>
          </p>
        </div>

        {/* ── Tracking steps ── */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm mb-4">
          <div className="flex items-center justify-between relative">
            {/* Line */}
            <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200 dark:bg-gray-700 z-0" />

            {[
              { icon: FaReceipt,     label: "Đã đặt",        active: true  },
              { icon: FaBox,         label: "Đang chuẩn bị", active: false },
              { icon: FaTruck,       label: "Đang giao",      active: false },
              { icon: FaHome,        label: "Đã nhận",        active: false },
            ].map((step, i) => (
              <div key={i} className="flex flex-col items-center gap-2 z-10">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-md transition ${
                  step.active
                    ? "bg-gradient-to-br from-primary to-secondary text-white"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-400"
                }`}>
                  <step.icon className="text-sm" />
                </div>
                <span className={`text-xs font-medium ${
                  step.active ? "text-primary" : "text-gray-400"
                }`}>
                  {step.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {order && (
          <div className="space-y-4">

            {/* ── Trạng thái ── */}
            <div className={`rounded-2xl p-4 flex items-center gap-3 ${sc.bg} dark:bg-opacity-10`}>
              <span className="text-2xl">{sc.icon}</span>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Trạng thái đơn hàng</p>
                <p className={`font-bold text-base ${sc.color}`}>{sc.label}</p>
              </div>
            </div>

            {/* ── Thông tin giao hàng ── */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
              <h2 className="font-bold mb-4 flex items-center gap-2">
                🏠 Thông tin giao hàng
              </h2>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-gray-400 text-xs mb-0.5">Người nhận</p>
                  <p className="font-medium">{order.name}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs mb-0.5">Số điện thoại</p>
                  <p className="font-medium">{order.phone}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs mb-0.5">Email</p>
                  <p className="font-medium">{order.email}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs mb-0.5">Thanh toán</p>
                  <p className="font-medium">
                    {order.payment_method === "cod" ? "💵 COD" : "🏦 Chuyển khoản"}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-gray-400 text-xs mb-0.5">Địa chỉ</p>
                  <p className="font-medium">{order.address}</p>
                </div>
                {order.note && (
                  <div className="col-span-2">
                    <p className="text-gray-400 text-xs mb-0.5">Ghi chú</p>
                    <p className="font-medium italic text-gray-500">{order.note}</p>
                  </div>
                )}
              </div>
            </div>

            {/* ── Sản phẩm ── */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
              <h2 className="font-bold mb-4 flex items-center gap-2">
                📦 Sản phẩm đã đặt ({order.items?.length})
              </h2>
              <div className="space-y-3">
                {order.items?.map((item) => (
                  <div key={item.id}
                       className="flex items-center gap-3 py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
                    {/* Ảnh */}
                    {getImageUrl(item.product_image) ? (
                      <img
                        src={getImageUrl(item.product_image)}
                        alt={item.product_name}
                        className="w-14 h-14 object-cover rounded-xl flex-shrink-0 border border-gray-100"
                      />
                    ) : (
                      <div className="w-14 h-14 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                        📦
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.product_name}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {Number(item.price).toLocaleString("vi-VN")}đ × {item.quantity}
                      </p>
                    </div>
                    <p className="text-sm font-bold text-primary flex-shrink-0">
                      {Number(item.subtotal).toLocaleString("vi-VN")}đ
                    </p>
                  </div>
                ))}
              </div>

              {/* Tổng tiền */}
              <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Tạm tính</span>
                  <span>{Number(order.subtotal).toLocaleString("vi-VN")}đ</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Phí vận chuyển</span>
                  <span className={order.shipping_fee == 0 ? "text-green-500 font-medium" : ""}>
                    {order.shipping_fee == 0
                      ? "Miễn phí"
                      : `${Number(order.shipping_fee).toLocaleString("vi-VN")}đ`}
                  </span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-1 border-t border-gray-100 dark:border-gray-700">
                  <span>Tổng cộng</span>
                  <span className="text-primary">
                    {Number(order.total).toLocaleString("vi-VN")}đ
                  </span>
                </div>
              </div>
            </div>

            {/* ── Thông báo ── */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-4 text-sm text-blue-600 dark:text-blue-400 flex items-start gap-3">
              <span className="text-xl flex-shrink-0">ℹ️</span>
              <div>
                <p className="font-medium mb-1">Thông tin quan trọng</p>
                <p className="text-blue-500 dark:text-blue-400 leading-relaxed">
                  Chúng tôi sẽ liên hệ với bạn qua số điện thoại{" "}
                  <span className="font-semibold">{order.phone}</span>{" "}
                  để xác nhận đơn hàng trong vòng 24 giờ.
                </p>
              </div>
            </div>

          </div>
        )}

        {/* ── Buttons ── */}
        <div className="flex flex-col sm:flex-row gap-3 mt-6">
          <Link
            to="/"
            className="flex-1 bg-gradient-to-r from-primary to-secondary text-white py-3 rounded-full font-medium hover:opacity-90 transition text-center"
          >
            🛍️ Tiếp tục mua sắm
          </Link>
          <Link
            to="/orders"
            className="flex-1 border-2 border-primary text-primary py-3 rounded-full font-medium hover:bg-primary hover:text-white transition text-center"
          >
            📦 Xem đơn hàng của tôi
          </Link>
        </div>

      </div>
    </div>
  );
};

export default OrderSuccess;