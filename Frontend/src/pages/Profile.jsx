import { useState } from "react";
import PropTypes from "prop-types";
import {
  FiUser,
  FiMail,
  FiPhone,
  FiLock,
  FiEdit2,
  FiCheck,
  FiX,
  FiAlertCircle,
  FiCheckCircle,
} from "react-icons/fi";

const Profile = ({ user = {}, onUpdate = () => {}, onChangePassword = () => {} }) => {
  const [editMode, setEditMode] = useState(false);
  const [passwordMode, setPasswordMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const [editData, setEditData] = useState({
    name: user.name || "",
    email: user.email || "",
    phone: user.phone || "",
    department: user.department || "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});

  const showMessage = (msg, type) => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(""), 3000);
  };

  const validateEditForm = () => {
    const newErrors = {};

    if (!editData.name.trim()) newErrors.name = "Name is required";
    if (!editData.email.trim()) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editData.email))
      newErrors.email = "Invalid email format";
    if (!editData.phone.trim()) newErrors.phone = "Phone is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePasswordForm = () => {
    const newErrors = {};

    if (!passwordData.currentPassword)
      newErrors.currentPassword = "Current password is required";
    if (!passwordData.newPassword)
      newErrors.newPassword = "New password is required";
    if (passwordData.newPassword.length < 6)
      newErrors.newPassword = "Password must be at least 6 characters";
    if (passwordData.newPassword !== passwordData.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();

    if (!validateEditForm()) return;

    setLoading(true);

    try {
      await onUpdate(editData);
      showMessage("Profile updated successfully!", "success");
      setEditMode(false);
    } catch (error) {
      showMessage(error.message || "Failed to update profile", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (!validatePasswordForm()) return;

    setLoading(true);

    try {
      await onChangePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      showMessage("Password changed successfully!", "success");
      setPasswordMode(false);
    } catch (error) {
      showMessage(error.message || "Failed to change password", "error");
    } finally {
      setLoading(false);
    }
  };

  const inputClasses =
    "w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition";
  const labelClasses = "block text-sm font-medium text-gray-700 mb-2";

  return (
    <div className="space-y-6">
      {/* Message Alert */}
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
          <p
            className={
              messageType === "success"
                ? "text-green-700"
                : "text-red-700"
            }
          >
            {message}
          </p>
        </div>
      )}

      {/* Profile Header Card */}
      <div className="bg-white rounded-lg shadow-sm p-8">
        <div className="flex items-center gap-6 mb-6">
          <div className="w-20 h-20 bg-linear-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
            {user.name?.charAt(0).toUpperCase() || "U"}
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-800">{user.name || "User"}</h2>
            <p className="text-gray-600">{user.role || "User"}</p>
            <p className="text-sm text-gray-500">
              Member since {user.joinDate ? new Date(user.joinDate).toLocaleDateString() : "N/A"}
            </p>
          </div>
        </div>
      </div>

      {/* Edit Profile Section */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold">Profile Information</h3>
          <button
            onClick={() => {
              setEditMode(!editMode);
              if (editMode) {
                setErrors({});
              } else {
                setEditData({
                  name: user.name || "",
                  email: user.email || "",
                  phone: user.phone || "",
                  department: user.department || "",
                });
              }
            }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className={labelClasses}>
                  <FiUser className="inline mr-2" /> Full Name
                </label>
                <input
                  id="name"
                  type="text"
                  name="name"
                  value={editData.name}
                  onChange={handleEditChange}
                  className={inputClasses}
                  disabled={loading}
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                )}
              </div>

              <div>
                <label htmlFor="email" className={labelClasses}>
                  <FiMail className="inline mr-2" /> Email
                </label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={editData.email}
                  onChange={handleEditChange}
                  className={inputClasses}
                  disabled={loading}
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                )}
              </div>

              <div>
                <label htmlFor="phone" className={labelClasses}>
                  <FiPhone className="inline mr-2" /> Phone
                </label>
                <input
                  id="phone"
                  type="tel"
                  name="phone"
                  value={editData.phone}
                  onChange={handleEditChange}
                  className={inputClasses}
                  disabled={loading}
                />
                {errors.phone && (
                  <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                )}
              </div>

              <div>
                <label htmlFor="department" className={labelClasses}>
                  Department
                </label>
                <input
                  id="department"
                  type="text"
                  name="department"
                  value={editData.department}
                  onChange={handleEditChange}
                  placeholder="Inventory Management"
                  className={inputClasses}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white py-2 px-6 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:bg-gray-400"
              >
                <FiCheck /> Save Changes
              </button>
              <button
                type="button"
                onClick={() => setEditMode(false)}
                disabled={loading}
                className="flex-1 bg-gray-200 text-gray-700 py-2 px-6 rounded-lg font-medium hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-600 mb-1 flex items-center gap-2">
                <FiUser /> Full Name
              </p>
              <p className="text-lg font-semibold text-gray-800">{user.name || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1 flex items-center gap-2">
                <FiMail /> Email
              </p>
              <p className="text-lg font-semibold text-gray-800">{user.email || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1 flex items-center gap-2">
                <FiPhone /> Phone
              </p>
              <p className="text-lg font-semibold text-gray-800">{user.phone || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Department</p>
              <p className="text-lg font-semibold text-gray-800">
                {user.department || "N/A"}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Change Password Section */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <FiLock /> Change Password
          </h3>
          <button
            onClick={() => {
              setPasswordMode(!passwordMode);
              if (passwordMode) {
                setErrors({});
              } else {
                setPasswordData({
                  currentPassword: "",
                  newPassword: "",
                  confirmPassword: "",
                });
              }
            }}
            className="text-blue-600 hover:text-blue-800 transition-colors"
          >
            {passwordMode ? "Cancel" : "Change Password"}
          </button>
        </div>

        {passwordMode ? (
          <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
            <div>
              <label htmlFor="currentPassword" className={labelClasses}>
                Current Password
              </label>
              <input
                id="currentPassword"
                type="password"
                name="currentPassword"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                className={inputClasses}
                disabled={loading}
              />
              {errors.currentPassword && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.currentPassword}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="newPassword" className={labelClasses}>
                New Password
              </label>
              <input
                id="newPassword"
                type="password"
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                className={inputClasses}
                disabled={loading}
              />
              {errors.newPassword && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.newPassword}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className={labelClasses}>
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                name="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                className={inputClasses}
                disabled={loading}
              />
              {errors.confirmPassword && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white py-2 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-400"
              >
                <FiCheck /> Update Password
              </button>
              <button
                type="button"
                onClick={() => setPasswordMode(false)}
                disabled={loading}
                className="flex-1 bg-gray-200 text-gray-700 py-2 px-6 rounded-lg font-medium hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <p className="text-gray-600">
            Keep your account secure by regularly updating your password.
          </p>
        )}
      </div>
    </div>
  );
};

Profile.propTypes = {
  user: PropTypes.shape({
    name: PropTypes.string,
    email: PropTypes.string,
    phone: PropTypes.string,
    department: PropTypes.string,
    role: PropTypes.string,
    joinDate: PropTypes.string,
  }),
  onUpdate: PropTypes.func,
  onChangePassword: PropTypes.func,
};

export default Profile;