import React, { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { FaSearch, FaFilter, FaTimes } from "react-icons/fa";
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

  const [filters, setFilters] = useState({
    search: searchParams.get("search") || "",
    category_id: searchParams.get("category_id") || "",
    sort: searchParams.get("sort") || "newest",
  });

  // ── Load categories ──
  useEffect(() => {
    categoryApi
      .getAll()
      .then((res) => setCategories(res.data.data))
      .catch(() => setCategories([]));
  }, []);

  // ── Fetch products ──
  useEffect(() => {
    const params = {};
    if (filters.search) params.search = filters.search;
    if (filters.category_id) params.category_id = filters.category_id;
    if (filters.sort) params.sort = filters.sort;

    setSearchParams(params);

    setLoading(true);

    productApi
      .getAll(params)
      .then((res) => {
        setProducts(res.data.data);
        setTotal(res.data.data.length);
      })
      .catch(() => {
        setProducts([]);
        setTotal(0);
      })
      .finally(() => setLoading(false));
  }, [filters, setSearchParams]);

  // ── Handlers ──
  const handleSearch = (e) => {
    e.preventDefault();
    const value = e.target.search.value.trim();
    setFilters((prev) => ({ ...prev, search: value }));
  };

  const handleFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      category_id: "",
      sort: "newest",
    });
  };

  const hasFilter =
    filters.search || filters.category_id || filters.sort !== "newest";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 dark:text-white py-10">
      <div className="container">
        {/* SEARCH */}
        <form onSubmit={handleSearch} className="flex gap-3 mb-8">
          <div className="relative flex-1">
            <input
              type="text"
              name="search"
              value={filters.search}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  search: e.target.value,
                }))
              }
              placeholder="Tìm kiếm sản phẩm..."
              className="w-full border rounded-full px-6 py-3 pr-12 text-sm"
            />
            <button
              type="submit"
              className="absolute right-4 top-1/2 -translate-y-1/2"
            >
              <FaSearch />
            </button>
          </div>

          <button
            type="button"
            onClick={() => setShowFilter(!showFilter)}
            className="px-5 py-3 border rounded-full flex items-center gap-2"
          >
            <FaFilter /> Bộ lọc
          </button>
        </form>

        {/* FILTER */}
        {showFilter && (
          <div className="bg-white p-5 rounded mb-6">
            <div className="grid sm:grid-cols-3 gap-4">
              {/* CATEGORY */}
              <select
                value={filters.category_id}
                onChange={(e) => handleFilter("category_id", e.target.value)}
                className="border p-2 rounded"
              >
                <option value="">Tất cả danh mục</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.label}
                  </option>
                ))}
              </select>

              {/* SORT */}
              <select
                value={filters.sort}
                onChange={(e) => handleFilter("sort", e.target.value)}
                className="border p-2 rounded"
              >
                <option value="newest">Mới nhất</option>
                <option value="price_asc">Giá tăng</option>
                <option value="price_desc">Giá giảm</option>
              </select>

              {/* CLEAR */}
              {hasFilter && (
                <button
                  onClick={clearFilters}
                  className="text-red-500 border px-3 py-2 rounded"
                >
                  <FaTimes /> Xóa
                </button>
              )}
            </div>
          </div>
        )}

        {/* RESULT */}
        <p className="mb-4 text-sm">
          {loading ? "Đang tìm..." : `Tìm thấy ${total} sản phẩm`}
        </p>

        {/* LIST */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-black border-t-transparent rounded-full animate-spin" />
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {products.map((product) => (
              <Link key={product.id} to={`/products/${product.id}`}>
                <img
                  src={getImageUrl(product.image)}
                  alt={product.name}
                  className="h-[180px] w-full object-cover rounded"
                />
                <p>{product.name}</p>
                <p>{Number(product.price).toLocaleString("vi-VN")}đ</p>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p>Không có sản phẩm</p>
            <button onClick={clearFilters}>Reset</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;
