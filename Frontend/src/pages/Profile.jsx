import { useEffect, useMemo, useState } from "react";
import {
  FiUser,
  FiMail,
  FiLock,
  FiEdit2,
  FiX,
  FiCheck,
  FiAlertCircle,
  FiCheckCircle,
} from "react-icons/fi";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const DEFAULT_API_BASE = "http://localhost:4000/api";

const Profile = () => {
  const navigate = useNavigate();

  const [admin, setAdmin] = useState(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [loading, setLoading] = useState(false);

  const [editMode, setEditMode] = useState(false);
  const [passwordMode, setPasswordMode] = useState(false);

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [errors, setErrors] = useState({});

  const [editData, setEditData] = useState({ name: "", email: "" });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const token = useMemo(() => localStorage.getItem("authToken") || "", []);
  const authHeaders = useMemo(
    () => ({ Authorization: `Bearer ${token}` }),
    [token]
  );

  const showMessage = (msg, type) => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(""), 3000);
  };

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (!token) {
        navigate("/");
        return;
      }

      setPageLoading(true);
      try {
        const res = await axios.get(`${DEFAULT_API_BASE}/me`, {
          headers: authHeaders,
        });

        if (cancelled) return;
        if (!res?.data?.success) {
          throw new Error(res?.data?.message || "Failed to load profile");
        }

        const a = res.data.user;
        setAdmin(a);
        setEditData({ name: a?.name || "", email: a?.email || "" });
        setAvatarPreview(a?.avatarPath ? `http://localhost:4000${a.avatarPath}` : "");
      } catch (e) {
        if (cancelled) return;
        const status = e?.response?.status;
        if (status === 401) {
          localStorage.removeItem("authToken");
          localStorage.removeItem("admin");
          localStorage.removeItem("user");
          localStorage.removeItem("role");
          localStorage.removeItem("loggedIn");
          navigate("/");
          return;
        }
        showMessage(
          e?.response?.data?.message || e?.message || "Failed to load profile",
          "error"
        );
      } finally {
        if (!cancelled) setPageLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [authHeaders, navigate, token]);

  const validateProfile = () => {
    const next = {};
    if (!editData.name.trim()) next.name = "Name is required";
    if (!editData.email.trim()) next.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editData.email)) {
      next.email = "Invalid email format";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const validatePassword = () => {
    const next = {};
    if (!passwordData.currentPassword) next.currentPassword = "Current password is required";
    if (!passwordData.newPassword) next.newPassword = "New password is required";
    if (passwordData.newPassword && passwordData.newPassword.length < 6) {
      next.newPassword = "Password must be at least 6 characters";
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      next.confirmPassword = "Passwords do not match";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!validateProfile()) return;

    setLoading(true);
    try {
      const form = new FormData();
      form.append("name", editData.name);
      form.append("email", editData.email);
      if (avatarFile) form.append("avatar", avatarFile);

      const res = await axios.patch(`${DEFAULT_API_BASE}/me`, form, {
        headers: authHeaders,
      });

      if (!res?.data?.success) {
        throw new Error(res?.data?.message || "Failed to update profile");
      }

      const updated = res.data.user || res.data.admin;
      if (!updated) {
        throw new Error("Failed to update profile");
      }
      setAdmin(updated);
      setAvatarFile(null);
      setAvatarPreview(updated?.avatarPath ? `http://localhost:4000${updated.avatarPath}` : "");

      const payload = {
        id: String(updated?._id || updated?.id || ""),
        name: updated?.name,
        email: updated?.email,
        role: updated?.role,
        avatarPath: updated?.avatarPath || "",
      };

      localStorage.setItem("user", JSON.stringify(payload));
      if (payload.role) localStorage.setItem("role", payload.role);

      // Backward compatibility for older code paths
      if (payload.role === "Admin") {
        localStorage.setItem("admin", JSON.stringify(payload));
      }

      showMessage("Profile updated successfully!", "success");
      setEditMode(false);
    } catch (e2) {
      showMessage(
        e2?.response?.data?.message || e2?.message || "Failed to update profile",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!validatePassword()) return;

    setLoading(true);
    try {
      const res = await axios.patch(
        `${DEFAULT_API_BASE}/me/password`,
        {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        },
        { headers: authHeaders }
      );

      if (!res?.data?.success) {
        throw new Error(res?.data?.message || "Failed to change password");
      }

      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      showMessage("Password changed successfully!", "success");
      setPasswordMode(false);
    } catch (e2) {
      showMessage(
        e2?.response?.data?.message || e2?.message || "Failed to change password",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const inputClasses =
    "w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition";
  const labelClasses = "block text-sm font-medium text-gray-700 mb-2";

  const displayInitial = (admin?.name || "U").charAt(0).toUpperCase();

  return (
    <div className="space-y-6">
      {message && (
        <div
          className={`p-4 rounded-lg flex items-center gap-3 ${
            messageType === "success"
              ? "bg-green-50 border border-green-200"
              : "bg-red-50 border border-red-200"
          }`}
        >
          {messageType === "success" ? (
            <FiCheckCircle className="text-green-600 text-xl shrink-0" />
          ) : (
            <FiAlertCircle className="text-red-600 text-xl shrink-0" />
          )}
          <p className={messageType === "success" ? "text-green-700" : "text-red-700"}>
            {message}
          </p>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm p-8">
        {pageLoading ? (
          <p className="text-gray-600">Loading profile...</p>
        ) : (
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-full overflow-hidden bg-linear-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-3xl font-bold">
              {avatarPreview ? (
                <img src={avatarPreview} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                displayInitial
              )}
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-800">{admin?.name || "User"}</h2>
              <p className="text-gray-600">{admin?.role || "User"}</p>
              <p className="text-sm text-gray-500">
                Member since {admin?.createdAt ? new Date(admin.createdAt).toLocaleDateString() : "N/A"}
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold">Profile Information</h3>
          <button
            onClick={() => {
              if (editMode) {
                setEditMode(false);
                setErrors({});
              } else {
                setEditData({ name: admin?.name || "", email: admin?.email || "" });
                setAvatarFile(null);
                setAvatarPreview(admin?.avatarPath ? `http://localhost:4000${admin.avatarPath}` : "");
                setEditMode(true);
              }
            }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            disabled={pageLoading}
          >
            {editMode ? (
              <>
                <FiX /> Cancel
              </>
            ) : (
              <>
                <FiEdit2 /> Edit Profile
              </>
            )}
          </button>
        </div>

        {editMode ? (
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label htmlFor="avatar" className={labelClasses}>
                  Profile Picture
                </label>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                    {avatarPreview ? (
                      <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-gray-600 font-semibold">{displayInitial}</span>
                    )}
                  </div>
                  <input
                    id="avatar"
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      setAvatarFile(file);
                      setAvatarPreview(URL.createObjectURL(file));
                    }}
                    className="block w-full text-sm text-gray-700"
                    disabled={loading}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">JPG/PNG/WEBP up to 2MB.</p>
              </div>

              <div>
                <label htmlFor="name" className={labelClasses}>
                  <FiUser className="inline mr-2" /> Full Name
                </label>
                <input
                  id="name"
                  type="text"
                  value={editData.name}
                  onChange={(e) => {
                    setEditData((p) => ({ ...p, name: e.target.value }));
                    if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
                  }}
                  className={inputClasses}
                  disabled={loading}
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>

              <div>
                <label htmlFor="email" className={labelClasses}>
                  <FiMail className="inline mr-2" /> Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={editData.email}
                  onChange={(e) => {
                    setEditData((p) => ({ ...p, email: e.target.value }));
                    if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                  }}
                  className={inputClasses}
                  disabled={loading}
                />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
              </div>
            </div>

            <div className="flex gap-4 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="flex items-center justify-center gap-2 bg-green-600 text-white py-2 px-6 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:bg-gray-400"
              >
                <FiCheck /> Save Changes
              </button>
            </div>
          </form>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-600 mb-1 flex items-center gap-2">
                <FiUser /> Full Name
              </p>
              <p className="text-lg font-semibold text-gray-800">{admin?.name || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1 flex items-center gap-2">
                <FiMail /> Email
              </p>
              <p className="text-lg font-semibold text-gray-800">{admin?.email || "N/A"}</p>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold">Password</h3>
          <button
            onClick={() => {
              setPasswordMode((v) => !v);
              setErrors({});
              setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
            }}
            className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
            disabled={pageLoading}
          >
            <FiLock /> {passwordMode ? "Cancel" : "Change Password"}
          </button>
        </div>

        {passwordMode && (
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="currentPassword" className={labelClasses}>
                  Current Password
                </label>
                <input
                  id="currentPassword"
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => {
                    setPasswordData((p) => ({ ...p, currentPassword: e.target.value }));
                    if (errors.currentPassword) setErrors((prev) => ({ ...prev, currentPassword: undefined }));
                  }}
                  className={inputClasses}
                  disabled={loading}
                />
                {errors.currentPassword && (
                  <p className="text-red-500 text-sm mt-1">{errors.currentPassword}</p>
                )}
              </div>

              <div>
                <label htmlFor="newPassword" className={labelClasses}>
                  New Password
                </label>
                <input
                  id="newPassword"
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => {
                    setPasswordData((p) => ({ ...p, newPassword: e.target.value }));
                    if (errors.newPassword) setErrors((prev) => ({ ...prev, newPassword: undefined }));
                  }}
                  className={inputClasses}
                  disabled={loading}
                />
                {errors.newPassword && <p className="text-red-500 text-sm mt-1">{errors.newPassword}</p>}
              </div>

              <div className="md:col-span-2">
                <label htmlFor="confirmPassword" className={labelClasses}>
                  Confirm New Password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => {
                    setPasswordData((p) => ({ ...p, confirmPassword: e.target.value }));
                    if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
                  }}
                  className={inputClasses}
                  disabled={loading}
                />
                {errors.confirmPassword && (
                  <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white py-2 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-400"
            >
              {loading ? "Updating..." : "Update Password"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Profile;
