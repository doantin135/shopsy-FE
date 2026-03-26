import React from "react";
import { Link } from "react-router-dom";
import { useWishlist } from "../context/WishlistContext";
import { useCart } from "../context/CartContext";
import { FaHeart, FaShoppingCart, FaTrash } from "react-icons/fa";

const getImageUrl = (image) => {
  if (!image) return "https://placehold.co/150x200?text=No+Image";
  if (image.startsWith("http")) return image;
  return `http://127.0.0.1:8000/storage/${image}`;
};

const Wishlist = () => {
  const { wishlist, removeFromWishlist, clearWishlist } = useWishlist();
  const { addToCart } = useCart();

  if (wishlist.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <FaHeart className="text-6xl text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-500 mb-2">
            Danh sách yêu thích trống
          </h2>
          <p className="text-gray-400 mb-6">
            Hãy thêm sản phẩm yêu thích của bạn!
          </p>
          <Link
            to="/"
            className="bg-gradient-to-r from-primary to-secondary text-white px-8 py-3 rounded-full font-medium hover:opacity-90 transition"
          >
            Khám phá sản phẩm
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
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <FaHeart className="text-red-500" />
              Yêu thích
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              {wishlist.length} sản phẩm
            </p>
          </div>
          <button
            onClick={clearWishlist}
            className="flex items-center gap-2 text-sm text-red-500 border border-red-300 px-4 py-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 transition"
          >
            <FaTrash className="text-xs" /> Xóa tất cả
          </button>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
          {wishlist.map((product) => (
            <div
              key={product.id}
              className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm group relative"
            >
              <button
                onClick={() => removeFromWishlist(product.id)}
                className="absolute top-3 right-3 z-10 w-8 h-8 bg-white dark:bg-gray-700 rounded-full flex items-center justify-center shadow-md hover:bg-red-500 hover:text-white transition"
              >
                <FaHeart className="text-red-500 group-hover:text-white text-sm" />
              </button>

              <Link to={`/products/${product.id}`}>
                <div className="overflow-hidden">
                  <img
                    src={getImageUrl(product.image)}
                    alt={product.name}
                    className="w-full h-[200px] object-cover group-hover:scale-105 transition duration-300"
                  />
                </div>
              </Link>

              <div className="p-3">
                <Link to={`/products/${product.id}`}>
                  <h3 className="font-semibold text-sm truncate hover:text-primary transition">
                    {product.name}
                  </h3>
                </Link>
                <div className="flex items-center gap-1.5 mt-1">
                  <span
                    className="w-3 h-3 rounded-full border border-gray-200 inline-block"
                    style={{ background: product.color }}
                  />
                  <p className="text-xs text-gray-500">{product.color}</p>
                </div>
                <p className="text-sm font-bold text-primary mt-1">
                  {Number(product.price).toLocaleString("vi-VN")}đ
                </p>

                <button
                  onClick={() => {
                    addToCart(product, 1);
                    removeFromWishlist(product.id);
                  }}
                  className="w-full mt-3 flex items-center justify-center gap-2 bg-primary/10 text-primary hover:bg-primary hover:text-white text-xs font-medium py-2 rounded-xl transition"
                >
                  <FaShoppingCart className="text-xs" />
                  Thêm vào giỏ
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Wishlist;
