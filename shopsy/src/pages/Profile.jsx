import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  updateProfile,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from "firebase/auth";
import { auth } from "../firebase/config";
import { FaUserCircle, FaShieldAlt, FaSignOutAlt } from "react-icons/fa";

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate          = useNavigate();

  // ── Tab ──
  const [activeTab, setActiveTab] = useState("info");

  // ── Form thông tin ──
  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [infoLoading, setInfoLoading] = useState(false);
  const [infoMsg, setInfoMsg]         = useState({ type: "", text: "" });

  // ── Form bảo mật ──
  const [currentPass, setCurrentPass]   = useState("");
  const [newPass, setNewPass]           = useState("");
  const [confirmPass, setConfirmPass]   = useState("");
  const [securityLoading, setSecurityLoading] = useState(false);
  const [securityMsg, setSecurityMsg]   = useState({ type: "", text: "" });

  const isGoogleUser = user?.providerData?.[0]?.providerId === "google.com";

  // ── Cập nhật tên ──
  const handleUpdateInfo = async (e) => {
    e.preventDefault();
    if (!displayName.trim()) return;
    setInfoLoading(true);
    setInfoMsg({ type: "", text: "" });
    try {
      await updateProfile(auth.currentUser, { displayName: displayName.trim() });
      setInfoMsg({ type: "success", text: "Cập nhật thông tin thành công!" });
    } catch {
      setInfoMsg({ type: "error", text: "Cập nhật thất bại. Vui lòng thử lại!" });
    } finally {
      setInfoLoading(false);
    }
  };

  // ── Đổi mật khẩu ──
  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setSecurityMsg({ type: "", text: "" });

    if (newPass.length < 6) {
      return setSecurityMsg({ type: "error", text: "Mật khẩu mới phải có ít nhất 6 ký tự!" });
    }
    if (newPass !== confirmPass) {
      return setSecurityMsg({ type: "error", text: "Mật khẩu xác nhận không khớp!" });
    }

    setSecurityLoading(true);
    try {
      // Xác thực lại trước khi đổi mật khẩu
      const credential = EmailAuthProvider.credential(user.email, currentPass);
      await reauthenticateWithCredential(auth.currentUser, credential);
      await updatePassword(auth.currentUser, newPass);
      setSecurityMsg({ type: "success", text: "Đổi mật khẩu thành công!" });
      setCurrentPass(""); setNewPass(""); setConfirmPass("");
    } catch (err) {
      if (err.code === "auth/wrong-password" || err.code === "auth/invalid-credential") {
        setSecurityMsg({ type: "error", text: "Mật khẩu hiện tại không đúng!" });
      } else {
        setSecurityMsg({ type: "error", text: "Đổi mật khẩu thất bại. Vui lòng thử lại!" });
      }
    } finally {
      setSecurityLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const tabs = [
    { id: "info",     label: "Thông tin",  icon: "👤" },
    { id: "security", label: "Bảo mật",    icon: "🔒" },
    { id: "orders",   label: "Đơn hàng",   icon: "📦" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 dark:text-white py-10">
      <div className="container max-w-3xl">

        {/* ── Profile Header ── */}
        <div className="bg-gradient-to-r from-primary to-secondary rounded-2xl p-6 mb-6 text-white relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-20 w-24 h-24 bg-white/10 rounded-full translate-y-1/2" />

          <div className="relative flex items-center gap-5">
            {/* Avatar */}
            <div className="relative">
              {user?.photoURL ? (
                <img
                  src={user.photoURL}
                  alt="avatar"
                  referrerPolicy="no-referrer"
                  className="w-20 h-20 rounded-full border-4 border-white/30 object-cover"
                />
              ) : (
                <div className="w-20 h-20 rounded-full border-4 border-white/30 bg-white/20 flex items-center justify-center">
                  <FaUserCircle className="text-5xl text-white/80" />
                </div>
              )}
              {isGoogleUser && (
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center text-xs">
                  G
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1">
              <h1 className="text-2xl font-bold">{user?.displayName || "Người dùng"}</h1>
              <p className="text-white/70 text-sm mt-0.5">{user?.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="bg-white/20 text-xs px-3 py-1 rounded-full">
                  {isGoogleUser ? "🔗 Google Account" : "📧 Email Account"}
                </span>
              </div>
            </div>

            {/* Logout button */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white text-sm px-4 py-2 rounded-full transition"
            >
              <FaSignOutAlt /> Đăng xuất
            </button>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="flex gap-2 mb-6 bg-white dark:bg-gray-800 p-1.5 rounded-xl shadow-sm">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-gradient-to-r from-primary to-secondary text-white shadow-md"
                  : "text-gray-500 dark:text-gray-400 hover:text-primary"
              }`}
            >
              <span>{tab.icon}</span> {tab.label}
            </button>
          ))}
        </div>

        {/* ── Tab: Thông tin ── */}
        {activeTab === "info" && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-bold mb-5 flex items-center gap-2">
              👤 Thông tin cá nhân
            </h2>

            {infoMsg.text && (
              <div className={`text-sm px-4 py-3 rounded-xl mb-4 ${
                infoMsg.type === "success"
                  ? "bg-green-50 text-green-600 border border-green-200"
                  : "bg-red-50 text-red-600 border border-red-200"
              }`}>
                {infoMsg.type === "success" ? "✅" : "❌"} {infoMsg.text}
              </div>
            )}

            <form onSubmit={handleUpdateInfo} className="space-y-4">
              {/* Tên hiển thị */}
              <div>
                <label className="block text-sm font-medium mb-1.5">Tên hiển thị</label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Nhập tên của bạn"
                  className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary transition"
                />
              </div>

              {/* Email — chỉ đọc */}
              <div>
                <label className="block text-sm font-medium mb-1.5">Email</label>
                <input
                  type="email"
                  value={user?.email || ""}
                  disabled
                  className="w-full border border-gray-200 dark:border-gray-700 dark:bg-gray-750 rounded-xl px-4 py-2.5 text-sm bg-gray-50 text-gray-400 cursor-not-allowed"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Email không thể thay đổi
                </p>
              </div>

              {/* Provider */}
              <div>
                <label className="block text-sm font-medium mb-1.5">Phương thức đăng nhập</label>
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                  <span className="text-xl">{isGoogleUser ? "🔗" : "📧"}</span>
                  <div>
                    <p className="text-sm font-medium">
                      {isGoogleUser ? "Google Account" : "Email & Password"}
                    </p>
                    <p className="text-xs text-gray-400">
                      {isGoogleUser
                        ? "Tài khoản được liên kết qua Google"
                        : "Đăng nhập bằng email và mật khẩu"}
                    </p>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={infoLoading}
                className="w-full bg-gradient-to-r from-primary to-secondary text-white py-3 rounded-full font-medium hover:opacity-90 transition disabled:opacity-60"
              >
                {infoLoading ? "Đang cập nhật..." : "💾 Lưu thay đổi"}
              </button>
            </form>
          </div>
        )}

        {/* ── Tab: Bảo mật ── */}
        {activeTab === "security" && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-bold mb-5 flex items-center gap-2">
              <FaShieldAlt className="text-primary" /> Bảo mật tài khoản
            </h2>

            {isGoogleUser ? (
              <div className="text-center py-10">
                <div className="text-5xl mb-4">🔗</div>
                <h3 className="font-bold text-lg mb-2">Tài khoản Google</h3>
                <p className="text-gray-500 text-sm">
                  Tài khoản của bạn được đăng nhập qua Google.
                  Vui lòng quản lý mật khẩu trong cài đặt Google Account.
                </p>
                <a
                  href="https://myaccount.google.com/security"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-block mt-4 bg-primary text-white px-6 py-2 rounded-full text-sm hover:opacity-90 transition"
                >
                  Đến Google Account →
                </a>
              </div>
            ) : (
              <>
                {securityMsg.text && (
                  <div className={`text-sm px-4 py-3 rounded-xl mb-4 ${
                    securityMsg.type === "success"
                      ? "bg-green-50 text-green-600 border border-green-200"
                      : "bg-red-50 text-red-600 border border-red-200"
                  }`}>
                    {securityMsg.type === "success" ? "✅" : "❌"} {securityMsg.text}
                  </div>
                )}

                <form onSubmit={handleUpdatePassword} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1.5">
                      Mật khẩu hiện tại <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      value={currentPass}
                      onChange={(e) => setCurrentPass(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary transition"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">
                      Mật khẩu mới <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      value={newPass}
                      onChange={(e) => setNewPass(e.target.value)}
                      placeholder="Ít nhất 6 ký tự"
                      required
                      className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary transition"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">
                      Xác nhận mật khẩu mới <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      value={confirmPass}
                      onChange={(e) => setConfirmPass(e.target.value)}
                      placeholder="Nhập lại mật khẩu mới"
                      required
                      className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary transition"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={securityLoading}
                    className="w-full bg-gradient-to-r from-primary to-secondary text-white py-3 rounded-full font-medium hover:opacity-90 transition disabled:opacity-60"
                  >
                    {securityLoading ? "Đang cập nhật..." : "🔒 Đổi mật khẩu"}
                  </button>
                </form>
              </>
            )}
          </div>
        )}

        {/* ── Tab: Đơn hàng — redirect ── */}
        {activeTab === "orders" && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm text-center">
            <div className="text-5xl mb-4">📦</div>
            <h3 className="font-bold text-lg mb-2">Đơn hàng của tôi</h3>
            <p className="text-gray-500 text-sm mb-5">
              Xem toàn bộ lịch sử đơn hàng của bạn
            </p>
            <a
              href="/orders"
              className="inline-block bg-gradient-to-r from-primary to-secondary text-white px-8 py-3 rounded-full font-medium hover:opacity-90 transition"
            >
              Xem đơn hàng →
            </a>
          </div>
        )}

      </div>
    </div>
  );
};

export default Profile;