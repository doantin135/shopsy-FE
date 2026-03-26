import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { orderApi } from "../api/index";

import {
  FaCheckCircle,
  FaBox,
  FaTruck,
  FaHome,
  FaReceipt,
  FaClock,
  FaCog,
  FaTimesCircle,
  FaMoneyBillWave,
  FaUniversity,
  FaInfoCircle,
  FaShoppingBag,
} from "react-icons/fa";

const statusMap = {
  pending: {
    label: "Chờ xác nhận",
    color: "text-yellow-500",
    bg: "bg-yellow-50",
    icon: FaClock,
  },
  processing: {
    label: "Đang xử lý",
    color: "text-blue-500",
    bg: "bg-blue-50",
    icon: FaCog,
  },
  shipped: {
    label: "Đang giao",
    color: "text-purple-500",
    bg: "bg-purple-50",
    icon: FaTruck,
  },
  delivered: {
    label: "Đã giao",
    color: "text-green-500",
    bg: "bg-green-50",
    icon: FaCheckCircle,
  },
  cancelled: {
    label: "Đã hủy",
    color: "text-red-500",
    bg: "bg-red-50",
    icon: FaTimesCircle,
  },
};

const getImageUrl = (image) => {
  if (!image) return null;
  if (image.startsWith("http")) return image;
  return `http://127.0.0.1:8000/storage/${image}`;
};

const OrderSuccess = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    orderApi
      .getById(id)
      .then((res) => {
        setOrder(res.data.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const sc = statusMap[order?.status] || statusMap.pending;
  const StatusIcon = sc.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-white to-secondary/5 dark:bg-gray-900 dark:text-white py-10">
      <div className="container max-w-2xl">
        {/* SUCCESS HEADER */}
        <div className="text-center mb-8">
          <div className="relative inline-flex items-center justify-center mb-4">
            <div className="w-28 h-28 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <FaCheckCircle className="text-6xl text-green-500" />
            </div>
            <div className="absolute inset-0 rounded-full border-4 border-green-200 animate-ping opacity-30" />
          </div>

          <h1 className="text-4xl font-bold text-green-500 mb-2">
            Đặt hàng thành công!
          </h1>

          <p className="text-gray-500">
            Cảm ơn bạn đã mua hàng tại{" "}
            <span className="font-bold text-primary">Shopsy</span>
          </p>

          <p className="text-sm mt-1">
            Mã đơn hàng:{" "}
            <span className="font-bold text-primary">#{order?.id}</span>
          </p>
        </div>

        {/* TRACKING */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm mb-4">
          <div className="flex items-center justify-between relative">
            <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200 z-0" />

            {[
              { icon: FaReceipt, label: "Đã đặt", active: true },
              { icon: FaBox, label: "Chuẩn bị", active: false },
              { icon: FaTruck, label: "Đang giao", active: false },
              { icon: FaHome, label: "Đã nhận", active: false },
            ].map((step, i) => (
              <div key={i} className="flex flex-col items-center gap-2 z-10">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    step.active
                      ? "bg-primary text-white"
                      : "bg-gray-100 text-gray-400"
                  }`}
                >
                  <step.icon />
                </div>
                <span className="text-xs">{step.label}</span>
              </div>
            ))}
          </div>
        </div>

        {order && (
          <div className="space-y-4">
            {/* STATUS */}
            <div className={`rounded-2xl p-4 flex items-center gap-3 ${sc.bg}`}>
              <StatusIcon className={`text-xl ${sc.color}`} />
              <div>
                <p className="text-xs text-gray-500">Trạng thái đơn hàng</p>
                <p className={`font-bold ${sc.color}`}>{sc.label}</p>
              </div>
            </div>

            {/* SHIPPING */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
              <h2 className="font-bold mb-4 flex items-center gap-2">
                <FaHome /> Thông tin giao hàng
              </h2>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <p>{order.name}</p>
                <p>{order.phone}</p>
                <p>{order.email}</p>
                <p>
                  {order.payment_method === "cod" ? (
                    <span className="flex items-center gap-1">
                      <FaMoneyBillWave /> COD
                    </span>
                  ) : (
                    <span className="flex items-center gap-1">
                      <FaUniversity /> Chuyển khoản
                    </span>
                  )}
                </p>
                <p className="col-span-2">{order.address}</p>
              </div>
            </div>

            {/* PRODUCTS */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
              <h2 className="font-bold mb-4 flex items-center gap-2">
                <FaBox /> Sản phẩm ({order.items?.length})
              </h2>

              {order.items?.map((item) => (
                <div key={item.id} className="flex justify-between py-2">
                  <div className="flex gap-3">
                    {getImageUrl(item.product_image) ? (
                      <img
                        src={getImageUrl(item.product_image)}
                        className="w-14 h-14 rounded-xl"
                      />
                    ) : (
                      <div className="w-14 h-14 flex items-center justify-center bg-gray-200 rounded-xl">
                        <FaBox />
                      </div>
                    )}
                    <div>
                      <p>{item.product_name}</p>
                      <p className="text-xs text-gray-500">x{item.quantity}</p>
                    </div>
                  </div>

                  <p className="text-primary font-bold">
                    {Number(item.subtotal).toLocaleString("vi-VN")}đ
                  </p>
                </div>
              ))}
            </div>

            {/* INFO */}
            <div className="bg-blue-50 rounded-2xl p-4 flex gap-3 text-blue-600">
              <FaInfoCircle />
              <p>Chúng tôi sẽ gọi xác nhận đơn hàng trong 24h.</p>
            </div>
          </div>
        )}

        {/* ACTION */}
        <div className="flex gap-3 mt-6">
          <Link
            to="/"
            className="flex-1 bg-primary text-white py-3 rounded-full flex items-center justify-center gap-2"
          >
            <FaShoppingBag />
            Mua tiếp
          </Link>

          <Link
            to="/orders"
            className="flex-1 border border-primary text-primary py-3 rounded-full flex items-center justify-center gap-2"
          >
            <FaBox />
            Đơn hàng
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;
