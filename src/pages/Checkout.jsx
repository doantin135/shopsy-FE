import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { orderApi } from "../api/index";

const getImageUrl = (image) => {
  if (!image) return "https://placehold.co/60x60?text=No+Image";
  if (image.startsWith("http")) return image;
  return `http://127.0.0.1:8000/storage/${image}`;
};

const safePrice = (val) => {
  const n = parseFloat(val);
  return isNaN(n) ? 0 : n;
};

const Checkout = () => {
  const { cartItems, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [isOrdered, setIsOrdered] = useState(false);

  // ✅ ép kiểu chắc chắn
  const safeTotalPrice = safePrice(totalPrice);

  const shippingFee = safeTotalPrice >= 500000 ? 0 : 30000;
  const total = safeTotalPrice + shippingFee;

  const [form, setForm] = useState({
    name: user?.displayName || "",
    email: user?.email || "",
    phone: "",
    address: "",
    note: "",
    payment_method: "cod",
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // 🚀 Fix redirect
  useEffect(() => {
    if (cartItems.length === 0 && !isOrdered) {
      navigate("/cart");
    }
  }, [cartItems, isOrdered, navigate]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const validate = () => {
    const err = {};
    if (!form.name.trim()) err.name = "Vui lòng nhập họ tên";
    if (!form.email.trim()) err.email = "Vui lòng nhập email";
    if (!form.phone.trim()) err.phone = "Vui lòng nhập số điện thoại";
    if (!form.address.trim()) err.address = "Vui lòng nhập địa chỉ";
    return err;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const err = validate();
    if (Object.keys(err).length > 0) {
      setErrors(err);
      return;
    }

    setLoading(true);

    try {
      const safeItems = cartItems.map((item) => ({
        product_id: item.id,
        product_name: item.name,
        product_image: item.image || null,
        price: safePrice(item.price),
        quantity: item.quantity,
        subtotal: safePrice(item.price) * item.quantity,
      }));

      const safeSubtotal = safeItems.reduce((s, i) => s + i.subtotal, 0);
      const safeShippingFee = safeSubtotal >= 500000 ? 0 : 30000;
      const safeTotal = safeSubtotal + safeShippingFee;

      const payload = {
        ...form,
        subtotal: safeSubtotal,
        shipping_fee: safeShippingFee,
        total: safeTotal,
        firebase_uid: user?.uid || null,
        items: safeItems,
      };

      const res = await orderApi.create(payload);

      setIsOrdered(true);
      clearCart();
      navigate(`/order-success/${res.data.data.id}`);
    } catch (err) {
      setErrors({
        submit:
          err.response?.data?.message ||
          JSON.stringify(err.response?.data?.errors) ||
          "Đặt hàng thất bại!",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 dark:text-white py-10">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Thanh toán</h1>

        {/* ERROR */}
        {errors.submit && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-500 rounded-xl text-sm">
            {errors.submit}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* LEFT */}
            <div className="lg:col-span-2">
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md border">

                <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
                  📋 Thông tin giao hàng
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

                  {/* INPUT COMPONENT */}
                  {[
                    { name: "name", label: "Họ và tên" },
                    { name: "email", label: "Email" },
                    { name: "phone", label: "Số điện thoại" },
                  ].map((field) => (
                    <div key={field.name}>
                      <label className="block text-sm font-medium mb-1">
                        {field.label}
                      </label>
                      <input
                        name={field.name}
                        value={form[field.name]}
                        onChange={handleChange}
                        className={`w-full px-4 py-2.5 rounded-xl border text-sm
                        focus:ring-2 focus:ring-orange-400 outline-none transition
                        dark:bg-gray-700 dark:border-gray-600
                        ${errors[field.name] ? "border-red-400" : "border-gray-300"}`}
                      />
                      {errors[field.name] && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors[field.name]}
                        </p>
                      )}
                    </div>
                  ))}

                  {/* ADDRESS */}
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium mb-1">
                      Địa chỉ
                    </label>
                    <input
                      name="address"
                      value={form.address}
                      onChange={handleChange}
                      className={`w-full px-4 py-2.5 rounded-xl border text-sm
                      focus:ring-2 focus:ring-orange-400 outline-none transition
                      dark:bg-gray-700 dark:border-gray-600
                      ${errors.address ? "border-red-400" : "border-gray-300"}`}
                    />
                    {errors.address && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.address}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT */}
            <div>
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md sticky top-24">

                <h2 className="text-lg font-semibold mb-4">
                  🛍️ Đơn hàng
                </h2>

                {/* PRODUCT */}
                <div className="space-y-3 mb-4 max-h-[250px] overflow-y-auto">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex items-center gap-3">
                      <img
                        src={getImageUrl(item.image)}
                        alt={item.name}
                        className="w-12 h-12 rounded-lg object-cover border"
                      />

                      <div className="flex-1">
                        <p className="text-sm font-medium line-clamp-1">
                          {item.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          x{item.quantity}
                        </p>
                      </div>

                      <p className="text-sm font-semibold text-orange-500">
                        {(safePrice(item.price) * item.quantity).toLocaleString("vi-VN")}đ
                      </p>
                    </div>
                  ))}
                </div>

                <hr className="my-4" />

                {/* PRICE */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Tạm tính</span>
                    <span>{safeTotalPrice.toLocaleString("vi-VN")}đ</span>
                  </div>

                  <div className="flex justify-between">
                    <span>Phí ship</span>
                    <span>
                      {shippingFee === 0
                        ? "Miễn phí"
                        : `${shippingFee.toLocaleString("vi-VN")}đ`}
                    </span>
                  </div>

                  <div className="flex justify-between text-lg font-bold border-t pt-2">
                    <span>Tổng</span>
                    <span className="text-orange-500">
                      {total.toLocaleString("vi-VN")}đ
                    </span>
                  </div>
                </div>

                {/* BUTTON */}
                <button
                  type="submit"
                  disabled={loading || cartItems.length === 0}
                  className="w-full mt-5 bg-gradient-to-r from-orange-500 to-orange-400 text-white py-3 rounded-full font-semibold hover:scale-105 transition disabled:opacity-60"
                >
                  {loading ? "Đang xử lý..." : "🛍️ Đặt hàng"}
                </button>

              </div>
            </div>

          </div>
        </form>
      </div>
    </div>
  );
};

export default Checkout;