import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom"; 
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar/Navbar";
import Hero from "./components/Hero/Hero";
import Products from "./components/Products/Products";
import TopProducts from "./components/TopProducts/TopProducts";
import Banner from "./components/Banner/Banner";
import Subscribe from "./components/Subscribe/Subscribe";
import Testimonials from "./components/Testimonials/Testimonials";
import Footer from "./components/Footer/Footer";
import Popup from "./components/Popup/Popup";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AOS from "aos";
import "aos/dist/aos.css";
import PropTypes from "prop-types";
import { productApi, categoryApi } from "./api/index";
import ProductDetail from "./pages/ProductDetail";
import CartProvider from "./context/CartProvider";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import OrderSuccess from "./pages/OrderSuccess";
import Search from "./pages/Search";
import OrderHistory from "./pages/OrderHistory";
import WishlistProvider from "./context/WishlistProvider";
import Wishlist       from "./pages/Wishlist";
import Profile from "./pages/Profile";

const navigationType = performance.getEntriesByType("navigation")[0]?.type;
if (navigationType === "reload" && window.location.pathname !== "/") {
  window.location.replace("/");
}

const Home = ({ handleOrderPopup, products, categories }) => (
  <>
    <Hero handleOrderPopup={handleOrderPopup} />
    <Products products={products} categories={categories} />
    <TopProducts handleOrderPopup={handleOrderPopup} />
    <Banner />
    <Subscribe />
    <Testimonials />
    <Footer />
  </>
);

Home.propTypes = {
  handleOrderPopup: PropTypes.func.isRequired,
  products:         PropTypes.array.isRequired,
  categories:       PropTypes.array.isRequired,
};

const App = () => {
  const [orderPopup, setOrderPopup] = useState(false);
  const [products, setProducts]     = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);

  const handleOrderPopup = () => setOrderPopup(!orderPopup);

  useEffect(() => {
    AOS.init({ offset: 100, duration: 800, easing: "ease-in-sine", delay: 100 });
    AOS.refresh();
  }, []);

  useEffect(() => {
    Promise.all([productApi.getAll(), categoryApi.getAll()])
      .then(([productsRes, categoriesRes]) => {
        setProducts(productsRes.data.data);
        setCategories(categoriesRes.data.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Lỗi fetch API:", err);
        setError("Không thể tải dữ liệu. Vui lòng thử lại.");
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500 text-sm">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="text-center">
          <p className="text-red-500 text-lg font-medium">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 bg-primary text-white px-6 py-2 rounded-full hover:opacity-90 transition"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
    <AuthProvider>
      <CartProvider>
        <WishlistProvider> 
          <div className="bg-white dark:bg-gray-900 dark:text-white duration-200">
            <Routes>
              <Route path="/login"    element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route
                path="/*"
                element={
                  <>
                    <Navbar />
                    <Routes>
                      <Route
                        path="/"
                        element={
                          <Home
                            handleOrderPopup={handleOrderPopup}
                            products={products}
                            categories={categories}
                          />
                        }
                      />
                      <Route path="/products/:id"      element={<ProductDetail />} />
                      <Route path="/cart"              element={<Cart />} />
                      <Route path="/checkout"          element={<Checkout />} />
                      <Route path="/order-success/:id" element={<OrderSuccess />} />
                      <Route path="/search"            element={<Search />} />
                      <Route path="/orders"            element={<OrderHistory />} />
                      <Route path="/wishlist"          element={<Wishlist />} />
                      <Route path="/profile" element={<Profile />} />
                    </Routes>
                    <Popup orderPopup={orderPopup} setOrderPopup={setOrderPopup} />
                  </>
                }
              />
            </Routes>
          </div>
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  </BrowserRouter>
  );
};

export default App;