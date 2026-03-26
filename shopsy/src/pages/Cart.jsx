import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { FaTrash, FaArrowLeft, FaShoppingBag } from "react-icons/fa";

const getImageUrl = (image) => {
  if (!image) return "https://placehold.co/80x80?text=No+Image";
  if (image.startsWith("http")) return image;
  return `http://127.0.0.1:8000/storage/${image}`;
};

const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity, clearCart, totalItems, totalPrice } = useCart();
  const navigate = useNavigate();

  // ── Giỏ trống ──
  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="text-center">
          <FaShoppingBag className="text-6xl text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-500 mb-2">Giỏ hàng trống</h2>
          <p className="text-gray-400 mb-6">Hãy thêm sản phẩm vào giỏ hàng!</p>
          <Link
            to="/"
            className="bg-gradient-to-r from-primary to-secondary text-white px-8 py-3 rounded-full font-medium hover:opacity-90 transition inline-flex items-center gap-2"
          >
            <FaArrowLeft /> Tiếp tục mua sắm
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 dark:text-white py-10">
      <div className="container">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Giỏ hàng</h1>
            <p className="text-gray-500 text-sm mt-1">{totalItems} sản phẩm</p>
          </div>
          <button
            onClick={clearCart}
            className="flex items-center gap-2 text-sm text-red-500 border border-red-300 px-4 py-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 transition"
          >
            <FaTrash className="text-xs" /> Xóa tất cả
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* ── Danh sách sản phẩm ── */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <div
                key={item.id}
                className="bg-white dark:bg-gray-800 rounded-2xl p-4 flex gap-4 items-center shadow-sm"
              >
                {/* Ảnh */}
                <Link to={`/products/${item.id}`}>
                  <img
                    src={getImageUrl(item.image)}
                    alt={item.name}
                    className="w-20 h-20 object-cover rounded-xl flex-shrink-0 hover:opacity-80 transition"
                  />
                </Link>

                {/* Thông tin */}
                <div className="flex-1 min-w-0">
                  <Link
                    to={`/products/${item.id}`}
                    className="font-semibold text-base hover:text-primary transition truncate block"
                  >
                    {item.name}
                  </Link>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span
                      className="w-3 h-3 rounded-full border border-gray-200 inline-block"
                      style={{ background: item.color }}
                    />
                    <span className="text-xs text-gray-500">{item.color}</span>
                  </div>
                  <p className="text-primary font-bold mt-1">
                    {Number(item.price).toLocaleString("vi-VN")}đ
                  </p>
                </div>

                {/* Số lượng */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="w-8 h-8 rounded-full border border-gray-300 dark:border-gray-600 flex items-center justify-center hover:border-primary hover:text-primary transition text-lg"
                  >
                    −
                  </button>
                  <span className="w-8 text-center font-semibold">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="w-8 h-8 rounded-full border border-gray-300 dark:border-gray-600 flex items-center justify-center hover:border-primary hover:text-primary transition text-lg"
                  >
                    +
                  </button>
                </div>

                {/* Tổng tiền item */}
                <div className="text-right flex-shrink-0 min-w-[90px]">
                  <p className="font-bold text-primary">
                    {(Number(item.price) * item.quantity).toLocaleString("vi-VN")}đ
                  </p>
                </div>

                {/* Xóa */}
                <button
                  onClick={() => removeFromCart(item.id)}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition flex-shrink-0"
                >
                  <FaTrash className="text-xs" />
                </button>
              </div>
            ))}
          </div>

          {/* ── Tóm tắt đơn hàng ── */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm sticky top-24">
              <h2 className="text-xl font-bold mb-6">Tóm tắt đơn hàng</h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Tạm tính ({totalItems} sp)</span>
                  <span>{totalPrice.toLocaleString("vi-VN")}đ</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Phí vận chuyển</span>
                  <span className="text-green-500 font-medium">
                    {totalPrice >= 500000 ? "Miễn phí" : "30.000đ"}
                  </span>
                </div>
                {totalPrice < 500000 && (
                  <div className="text-xs text-gray-400 bg-gray-50 dark:bg-gray-700 p-2 rounded-lg">
                    🚚 Mua thêm{" "}
                    <span className="text-primary font-medium">
                      {(500000 - totalPrice).toLocaleString("vi-VN")}đ
                    </span>{" "}
                    để được miễn phí vận chuyển
                  </div>
                )}
                <hr className="border-gray-200 dark:border-gray-700" />
                <div className="flex justify-between font-bold text-lg">
                  <span>Tổng cộng</span>
                  <span className="text-primary">
                    {(totalPrice + (totalPrice >= 500000 ? 0 : 30000)).toLocaleString("vi-VN")}đ
                  </span>
                </div>
              </div>

              <button
                onClick={() => navigate("/checkout")}
                className="w-full bg-gradient-to-r from-primary to-secondary text-white py-3 rounded-full font-medium hover:opacity-90 hover:scale-105 transition-all duration-200"
              >
                Tiến hành thanh toán
              </button>

              <Link
                to="/"
                className="w-full mt-3 flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-primary transition py-2"
              >
                <FaArrowLeft className="text-xs" /> Tiếp tục mua sắm
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Cart;