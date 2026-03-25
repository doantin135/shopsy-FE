import React, { useState } from "react";
import Logo from "../../assets/logo.png";
import { IoMdSearch } from "react-icons/io";
import { FaCartShopping } from "react-icons/fa6";
import { FaCaretDown, FaUserCircle, FaHeart } from "react-icons/fa";
import DarkMode from "./DarkMode";
import { useAuth } from "../../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";

const Menu = [
  { id: 1, name: "Home", link: "/" },
  { id: 2, name: "Top Rated", link: "/#services" },
  { id: 3, name: "Kids Wear", link: "/" },
  { id: 4, name: "Mens Wear", link: "/" },
  { id: 5, name: "Electronics", link: "/" },
];

const DropdownLinks = [
  { id: 1, name: "Trending Products", link: "/" },
  { id: 2, name: "Best Selling", link: "/" },
  { id: 3, name: "Top Rated", link: "/" },
];

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { totalItems } = useCart();
  const [keyword, setKeyword] = useState("");
  const { totalWishlist } = useWishlist();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (keyword.trim()) {
      navigate(`/search?search=${encodeURIComponent(keyword.trim())}`);
    } else {
      navigate("/search");
    }
    setKeyword("");
  };

  return (
    <div className="shadow-md bg-white dark:bg-gray-900 dark:text-white duration-200 relative z-40">
      {/* ── Upper Navbar ── */}
      <div className="bg-primary/40 py-2">
        <div className="container flex justify-between items-center">
          {/* Logo */}
          <div>
            <Link
              to="/"
              className="font-bold text-2xl sm:text-3xl flex gap-2 items-center"
            >
              <img src={Logo} alt="Logo" className="w-10" />
              Shopsy
            </Link>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-4">
            {/* Search */}
            <form
              onSubmit={handleSearch}
              className="relative group hidden sm:block"
            >
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Tìm kiếm..."
                className="w-[200px] group-hover:w-[300px] transition-all duration-300 rounded-full border border-gray-300 px-2 py-1 focus:outline-none focus:border-primary dark:border-gray-500 dark:bg-gray-800"
              />
              <button
                type="submit"
                className="absolute top-1/2 -translate-y-1/2 right-3"
              >
                <IoMdSearch className="text-gray-500 hover:text-primary transition" />
              </button>
            </form>

            {/* Cart */}
            <Link
              to="/cart"
              className="bg-gradient-to-r from-primary to-secondary transition-all duration-200 text-white py-1 px-4 rounded-full flex items-center gap-3 group relative"
            >
              <span className="group-hover:block hidden transition-all duration-200">
                Giỏ hàng
              </span>
              <FaCartShopping className="text-xl text-white drop-shadow-sm cursor-pointer" />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                  {totalItems > 99 ? "99+" : totalItems}
                </span>
              )}
            </Link>

            <Link
              to="/wishlist"
              className="relative text-gray-600 dark:text-gray-300 hover:text-red-500 transition"
            >
              <FaHeart className="text-xl" />
              {totalWishlist > 0 && (
                <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                  {totalWishlist}
                </span>
              )}
            </Link>

            {/* Dark mode */}
            <DarkMode />

            {/* User / Login */}
            {user ? (
              <div className="relative group">
                {/* Avatar */}
                <div className="flex items-center gap-2 cursor-pointer">
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      className="w-8 h-8 rounded-full border-2 border-primary"
                      alt="avatar"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <FaUserCircle className="text-2xl text-primary" />
                  )}
                  <span className="hidden sm:block text-sm font-medium max-w-[100px] truncate">
                    {user.displayName || user.email}
                  </span>
                </div>

                {/* Dropdown */}
                <div className="absolute right-0 top-full pt-2 w-48 hidden group-hover:block z-50">
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
                    <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                      <p className="text-xs text-gray-400">Đã đăng nhập</p>
                      <p className="text-sm font-medium truncate">
                        {user.displayName || user.email}
                      </p>
                    </div>
                    <Link
                      to="/profile"
                      className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition flex items-center gap-2"
                    >
                      👤 Trang cá nhân
                    </Link>
                    <Link
                      to="/orders"
                      className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition flex items-center gap-2"
                    >
                      📦 Đơn hàng của tôi
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-gray-700 rounded-b-xl transition"
                    >
                      Đăng xuất
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <Link
                to="/login"
                className="text-sm font-medium text-primary border border-primary px-4 py-1 rounded-full hover:bg-primary hover:text-white transition duration-200"
              >
                Đăng nhập
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* ── Lower Navbar ── */}
      <div data-aos="zoom-in" className="flex justify-center">
        <ul className="sm:flex hidden items-center gap-4">
          {/* ✅ Dùng Link thay <a> để tránh bị mất tag */}
          {Menu.map((data) => (
            <li key={data.id}>
              <Link
                to={data.link}
                className="inline-block px-4 hover:text-primary duration-200"
              >
                {data.name}
              </Link>
            </li>
          ))}

          {/* Dropdown */}
          <li className="group relative cursor-pointer">
            <Link to="/" className="flex items-center gap-[2px] py-2">
              Trending Products
              <FaCaretDown className="transition-all duration-200 group-hover:rotate-180" />
            </Link>
            <div className="absolute z-[9999] hidden group-hover:block w-[200px] rounded-md bg-white dark:bg-gray-800 p-2 text-black dark:text-white shadow-md">
              <ul>
                {DropdownLinks.map((data) => (
                  <li key={data.id}>
                    <Link
                      to={data.link}
                      className="inline-block w-full rounded-md p-2 hover:bg-primary/20"
                    >
                      {data.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Navbar;
