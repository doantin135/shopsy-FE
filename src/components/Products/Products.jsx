import React, { useState } from "react";
import PropTypes from "prop-types";
import { FaStar } from "react-icons/fa6";
import { Link } from "react-router-dom";
import { useWishlist } from "../../context/WishlistContext";
import { FaHeart, FaRegHeart } from "react-icons/fa";

const getImageUrl = (image) => {
  if (!image) return "https://placehold.co/150x220?text=No+Image";
  if (image.startsWith("http")) return image;
  return `http://127.0.0.1:8000/storage/${image}`;
};

const Products = ({ products, categories }) => {
  const [activeCategory, setActiveCategory] = useState(null);
  const { toggleWishlist, isWishlisted } = useWishlist();

  const filtered = activeCategory
    ? products.filter((p) => p.category_id === activeCategory)
    : products;

  return (
    <div className="mt-14 mb-12">
      <div className="container">
        {/* Header */}
        <div className="text-center mb-10 max-w-[600px] mx-auto">
          <p data-aos="fade-up" className="text-sm text-primary">
            Top Selling Products for you
          </p>
          <h1 data-aos="fade-up" className="text-3xl font-bold">
            Products
          </h1>
          <p data-aos="fade-up" className="text-xs text-gray-400">
            Lorem ipsum dolor sit amet consectetur, adipisicing elit.
          </p>
        </div>

        {/* Filter by category */}
        {categories.length > 0 && (
          <div
            data-aos="fade-up"
            className="flex justify-center gap-3 flex-wrap mb-8"
          >
            <button
              onClick={() => setActiveCategory(null)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                activeCategory === null
                  ? "bg-primary text-white shadow-md"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-primary/10"
              }`}
            >
              Tất cả
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                  activeCategory === cat.id
                    ? "bg-primary text-white shadow-md"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-primary/10"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        )}

        {/* Products grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 place-items-center gap-5">
          {filtered.length > 0 ? (
            filtered.map((product) => (
              <div
                key={product.id}
                data-aos="fade-up"
                data-aos-delay={product.aosDelay}
                className="space-y-3 cursor-pointer group relative"
              >
                {/* ✅ Nút Wishlist */}
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    toggleWishlist(product);
                  }}
                  className="absolute top-2 right-2 z-10 w-8 h-8 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-md hover:scale-110 transition"
                >
                  {isWishlisted(product.id) ? (
                    <FaHeart className="text-red-500 text-sm" />
                  ) : (
                    <FaRegHeart className="text-gray-400 text-sm" />
                  )}
                </button>

                {/* Ảnh + Link */}
                <Link to={`/products/${product.id}`}>
                  <div className="overflow-hidden rounded-md">
                    <img
                      src={getImageUrl(product.image)}
                      alt={product.name}
                      className="h-[220px] w-[150px] object-cover rounded-md group-hover:scale-105 transition duration-300"
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold">{product.name}</h3>
                    <div className="flex items-center gap-1.5">
                      <span
                        className="inline-block w-3 h-3 rounded-full border border-gray-300"
                        style={{ background: product.color }}
                      />
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {product.color}
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-primary mt-1">
                      {Number(product.price).toLocaleString("vi-VN")}đ
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      <FaStar className="text-yellow-400 text-xs" />
                      <span className="text-xs text-gray-500">
                        {product.category?.label ?? "—"}
                      </span>
                    </div>
                  </div>
                </Link>
              </div>
            ))
          ) : (
            <div className="col-span-5 text-center text-gray-400 py-10">
              Không có sản phẩm nào.
            </div>
          )}
        </div>

        {/* View all button */}
        <div className="flex justify-center">
          <button className="text-center mt-10 cursor-pointer bg-primary text-white py-1 px-5 rounded-md hover:bg-primary/90 transition">
            View All
          </button>
        </div>
      </div>
    </div>
  );
};

Products.propTypes = {
  products: PropTypes.array.isRequired,
  categories: PropTypes.array.isRequired,
};

export default Products;
