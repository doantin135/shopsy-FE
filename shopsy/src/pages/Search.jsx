import React, { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { FaStar, FaSearch, FaFilter, FaTimes } from "react-icons/fa";
import { productApi, categoryApi } from "../api/index";

const getImageUrl = (image) => {
  if (!image) return "https://placehold.co/150x220?text=No+Image";
  if (image.startsWith("http")) return image;
  return `http://127.0.0.1:8000/storage/${image}`;
};

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [showFilter, setShowFilter] = useState(false);

  // Lấy params từ URL
  const [filters, setFilters] = useState({
    search: searchParams.get("search") || "",
    category_id: searchParams.get("category_id") || "",
    sort: searchParams.get("sort") || "newest",
  });

  // Load categories
  useEffect(() => {
    categoryApi.getAll().then((res) => setCategories(res.data.data));
  }, []);

  // Search khi filters thay đổi
  useEffect(() => {
    const params = {};
    if (filters.search) params.search = filters.search;
    if (filters.category_id) params.category_id = filters.category_id;
    if (filters.sort) params.sort = filters.sort;

    // Cập nhật URL
    setSearchParams(params);

    setLoading(true);
    productApi
      .getAll(params)
      .then((res) => {
        setProducts(res.data.data);
        setTotal(res.data.data.length);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [filters, setSearchParams]);

  const handleSearch = (e) => {
    e.preventDefault();
    setFilters({ ...filters, search: e.target.search.value });
  };

  const handleFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({ search: "", category_id: "", sort: "newest" });
  };

  const hasFilter =
    filters.search || filters.category_id || filters.sort !== "newest";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 dark:text-white py-10">
      <div className="container">
        {/* ── Search bar ── */}
        <form onSubmit={handleSearch} className="flex gap-3 mb-8">
          <div className="relative flex-1">
            <input
              type="text"
              name="search"
              defaultValue={filters.search}
              placeholder="Tìm kiếm sản phẩm..."
              className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-800 rounded-full px-6 py-3 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-primary transition"
            />
            <button
              type="submit"
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary transition"
            >
              <FaSearch />
            </button>
          </div>
          <button
            type="button"
            onClick={() => setShowFilter(!showFilter)}
            className={`flex items-center gap-2 px-5 py-3 rounded-full border text-sm font-medium transition ${
              showFilter
                ? "bg-primary text-white border-primary"
                : "border-gray-300 dark:border-gray-600 hover:border-primary hover:text-primary"
            }`}
          >
            <FaFilter className="text-xs" /> Bộ lọc
          </button>
        </form>

        {/* ── Filter panel ── */}
        {showFilter && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 mb-6 shadow-sm">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Category */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Danh mục
                </label>
                <select
                  value={filters.category_id}
                  onChange={(e) => handleFilter("category_id", e.target.value)}
                  className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Tất cả danh mục</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Sắp xếp theo
                </label>
                <select
                  value={filters.sort}
                  onChange={(e) => handleFilter("sort", e.target.value)}
                  className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="newest">Mới nhất</option>
                  <option value="price_asc">Giá tăng dần</option>
                  <option value="price_desc">Giá giảm dần</option>
                </select>
              </div>

              {/* Clear filter */}
              <div className="flex items-end">
                {hasFilter && (
                  <button
                    onClick={clearFilters}
                    className="flex items-center gap-2 text-sm text-red-500 border border-red-300 px-4 py-2.5 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                  >
                    <FaTimes className="text-xs" /> Xóa bộ lọc
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── Active filters ── */}
        {hasFilter && (
          <div className="flex items-center gap-2 flex-wrap mb-5">
            <span className="text-sm text-gray-500">Đang lọc:</span>
            {filters.search && (
              <span className="flex items-center gap-1 bg-primary/10 text-primary text-xs px-3 py-1 rounded-full">
                🔍 {filters.search}
                <button onClick={() => handleFilter("search", "")}>
                  <FaTimes className="text-xs ml-1" />
                </button>
              </span>
            )}
            {filters.category_id && (
              <span className="flex items-center gap-1 bg-primary/10 text-primary text-xs px-3 py-1 rounded-full">
                🏷️ {categories.find((c) => c.id == filters.category_id)?.label}
                <button onClick={() => handleFilter("category_id", "")}>
                  <FaTimes className="text-xs ml-1" />
                </button>
              </span>
            )}
            {filters.sort !== "newest" && (
              <span className="flex items-center gap-1 bg-primary/10 text-primary text-xs px-3 py-1 rounded-full">
                📊{" "}
                {filters.sort === "price_asc" ? "Giá tăng dần" : "Giá giảm dần"}
                <button onClick={() => handleFilter("sort", "newest")}>
                  <FaTimes className="text-xs ml-1" />
                </button>
              </span>
            )}
          </div>
        )}

        {/* ── Result count ── */}
        <div className="flex items-center justify-between mb-5">
          <p className="text-sm text-gray-500">
            {loading ? "Đang tìm..." : `Tìm thấy ${total} sản phẩm`}
            {filters.search && (
              <span>
                {" "}
                cho{" "}
                <span className="font-medium text-primary">
                  &ldquo;{filters.search}&rdquo;
                </span>
              </span>
            )}
          </p>
        </div>

        {/* ── Products grid ── */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
            {products.map((product) => (
              <Link
                to={`/products/${product.id}`}
                key={product.id}
                className="group space-y-3"
              >
                <div className="overflow-hidden rounded-xl bg-white dark:bg-gray-800 shadow-sm">
                  <img
                    src={getImageUrl(product.image)}
                    alt={product.name}
                    className="h-[200px] w-full object-cover group-hover:scale-105 transition duration-300"
                  />
                </div>
                <div>
                  <h3 className="font-semibold text-sm truncate">
                    {product.name}
                  </h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span
                      className="inline-block w-3 h-3 rounded-full border border-gray-200"
                      style={{ background: product.color }}
                    />
                    <p className="text-xs text-gray-500">{product.color}</p>
                  </div>
                  <p className="text-sm font-bold text-primary mt-1">
                    {Number(product.price).toLocaleString("vi-VN")}đ
                  </p>
                  {product.category && (
                    <div className="flex items-center gap-1 mt-1">
                      <FaStar className="text-yellow-400 text-xs" />
                      <span className="text-xs text-gray-500">
                        {product.category.label}
                      </span>
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-bold text-gray-500 mb-2">
              Không tìm thấy sản phẩm
            </h3>
            <p className="text-gray-400 mb-6">
              Thử tìm với từ khóa khác hoặc xóa bộ lọc
            </p>
            <button
              onClick={clearFilters}
              className="bg-primary text-white px-6 py-2 rounded-full hover:opacity-90 transition"
            >
              Xóa bộ lọc
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;
