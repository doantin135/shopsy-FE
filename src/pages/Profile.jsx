import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import {
  updateProfile,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from "firebase/auth";
import { auth } from "../firebase/config";
import {
  FaUserCircle,
  FaShieldAlt,
  FaSignOutAlt,
  FaBoxOpen,
} from "react-icons/fa";

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // ── Tabs ──
  const [activeTab, setActiveTab] = useState("info");

  // ── Info ──
  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [infoLoading, setInfoLoading] = useState(false);
  const [infoMsg, setInfoMsg] = useState({ type: "", text: "" });

  // ── Security ──
  const [currentPass, setCurrentPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [securityLoading, setSecurityLoading] = useState(false);
  const [securityMsg, setSecurityMsg] = useState({ type: "", text: "" });

  const isGoogleUser = user?.providerData?.[0]?.providerId === "google.com";

  // ── Update Info ──
  const handleUpdateInfo = async (e) => {
    e.preventDefault();
    if (!displayName.trim()) return;

    setInfoLoading(true);
    setInfoMsg({ type: "", text: "" });

    try {
      await updateProfile(auth.currentUser, {
        displayName: displayName.trim(),
      });
      setInfoMsg({ type: "success", text: "Cập nhật thành công!" });
    } catch {
      setInfoMsg({ type: "error", text: "Cập nhật thất bại!" });
    } finally {
      setInfoLoading(false);
    }
  };

  // ── Update Password ──
  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setSecurityMsg({ type: "", text: "" });

    if (newPass.length < 6) {
      return setSecurityMsg({
        type: "error",
        text: "Mật khẩu tối thiểu 6 ký tự",
      });
    }

    if (newPass !== confirmPass) {
      return setSecurityMsg({
        type: "error",
        text: "Mật khẩu không khớp",
      });
    }

    setSecurityLoading(true);

    try {
      const credential = EmailAuthProvider.credential(user.email, currentPass);

      await reauthenticateWithCredential(auth.currentUser, credential);
      await updatePassword(auth.currentUser, newPass);

      setSecurityMsg({
        type: "success",
        text: "Đổi mật khẩu thành công!",
      });

      setCurrentPass("");
      setNewPass("");
      setConfirmPass("");
    } catch (err) {
      if (
        err.code === "auth/wrong-password" ||
        err.code === "auth/invalid-credential"
      ) {
        setSecurityMsg({
          type: "error",
          text: "Mật khẩu hiện tại không đúng",
        });
      } else {
        setSecurityMsg({
          type: "error",
          text: "Có lỗi xảy ra",
        });
      }
    } finally {
      setSecurityLoading(false);
    }
  };

  // ── Logout ──
  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const tabs = [
    { id: "info", label: "Thông tin", icon: <FaUserCircle /> },
    { id: "security", label: "Bảo mật", icon: <FaShieldAlt /> },
    { id: "orders", label: "Đơn hàng", icon: <FaBoxOpen /> },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 dark:text-white py-10">
      <div className="container max-w-3xl">
        {/* HEADER */}
        <div className="bg-gradient-to-r from-primary to-secondary rounded-2xl p-6 mb-6 text-white flex items-center gap-5">
          {user?.photoURL ? (
            <img
              src={user.photoURL}
              alt="avatar"
              className="w-20 h-20 rounded-full object-cover"
            />
          ) : (
            <FaUserCircle className="text-6xl" />
          )}

          <div className="flex-1">
            <h1 className="text-xl font-bold">{user?.displayName || "User"}</h1>
            <p className="text-sm">{user?.email}</p>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full"
          >
            <FaSignOutAlt /> Logout
          </button>
        </div>

        {/* TABS */}
        <div className="flex gap-2 mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded ${
                activeTab === tab.id ? "bg-primary text-white" : "bg-gray-200"
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* INFO */}
        {activeTab === "info" && (
          <form onSubmit={handleUpdateInfo} className="space-y-4">
            <input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full p-3 border rounded"
              placeholder="Tên"
            />

            <button
              disabled={infoLoading}
              className="w-full bg-primary text-white py-3 rounded"
            >
              {infoLoading ? "Loading..." : "Lưu"}
            </button>

            {infoMsg.text && <p>{infoMsg.text}</p>}
          </form>
        )}

        {/* SECURITY */}
        {activeTab === "security" && !isGoogleUser && (
          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <input
              type="password"
              placeholder="Mật khẩu hiện tại"
              value={currentPass}
              onChange={(e) => setCurrentPass(e.target.value)}
              className="w-full p-3 border rounded"
            />

            <input
              type="password"
              placeholder="Mật khẩu mới"
              value={newPass}
              onChange={(e) => setNewPass(e.target.value)}
              className="w-full p-3 border rounded"
            />

            <input
              type="password"
              placeholder="Xác nhận mật khẩu"
              value={confirmPass}
              onChange={(e) => setConfirmPass(e.target.value)}
              className="w-full p-3 border rounded"
            />

            <button
              type="submit"
              disabled={securityLoading}
              className="w-full bg-primary text-white py-3 rounded disabled:opacity-60"
            >
              {securityLoading ? "Đang xử lý..." : "Đổi mật khẩu"}
            </button>

            {securityMsg.text && <p>{securityMsg.text}</p>}
          </form>
        )}

        {/* ORDERS */}
        {activeTab === "orders" && (
          <div className="text-center">
            <Link
              to="/orders"
              className="bg-primary text-white px-6 py-3 rounded-full"
            >
              Xem đơn hàng
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
