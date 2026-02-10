import { useEffect, useMemo, useState } from "react";
import axios from "axios";

const DEFAULT_API_BASE = "http://localhost:4000/api";

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const token = useMemo(() => localStorage.getItem("authToken") || "", []);
  const role = useMemo(() => localStorage.getItem("role") || "", []);
  const headers = useMemo(() => ({ Authorization: `Bearer ${token}` }), [token]);

  const loadUsers = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(`${DEFAULT_API_BASE}/users`, { headers });
      if (!res?.data?.success) throw new Error(res?.data?.message || "Failed to load users");
      setUsers(res.data.data || []);
    } catch (e) {
      setError(e?.response?.data?.message || e?.message || "Failed to load users");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // If not admin, do not show the page.
    if (role !== "Admin") {
      setError("Forbidden");
      return;
    }
    if (!token) {
      setError("Unauthorized");
      return;
    }
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role, token]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSuccess("");
    setError("");

    if (!form.name.trim() || !form.email.trim() || !form.password) {
      setError("Name, email and password are required");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(
        `${DEFAULT_API_BASE}/users`,
        {
          name: form.name.trim(),
          email: form.email.trim(),
          password: form.password,
        },
        { headers }
      );

      if (!res?.data?.success) throw new Error(res?.data?.message || "Failed to create user");

      setForm({ name: "", email: "", password: "" });
      setSuccess("User created");
      await loadUsers();
    } catch (e2) {
      setError(e2?.response?.data?.message || e2?.message || "Failed to create user");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const ok = window.confirm("Delete this user?");
    if (!ok) return;

    setLoading(true);
    setSuccess("");
    setError("");
    try {
      const res = await axios.delete(`${DEFAULT_API_BASE}/users/${id}`, { headers });
      if (!res?.data?.success) throw new Error(res?.data?.message || "Failed to delete user");
      setSuccess("User deleted");
      await loadUsers();
    } catch (e) {
      setError(e?.response?.data?.message || e?.message || "Failed to delete user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-2xl font-semibold mb-4">Manage Users</h2>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded text-green-700 text-sm">
            {success}
          </div>
        )}

        <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              disabled={loading || role !== "Admin"}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              disabled={loading || role !== "Admin"}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              disabled={loading || role !== "Admin"}
            />
          </div>
          <div className="md:col-span-3">
            <button
              type="submit"
              disabled={loading || role !== "Admin"}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
            >
              {loading ? "Working..." : "Add User"}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold">Users</h3>
          <button
            type="button"
            onClick={loadUsers}
            disabled={loading || role !== "Admin"}
            className="bg-gray-200 text-gray-800 px-3 py-2 rounded-lg hover:bg-gray-300 disabled:bg-gray-100"
          >
            Refresh
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100 text-gray-700">
                <th className="px-4 py-2 border-b">Name</th>
                <th className="px-4 py-2 border-b">Email</th>
                <th className="px-4 py-2 border-b">Last Login</th>
                <th className="px-4 py-2 border-b">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id || u.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2">{u.name}</td>
                  <td className="px-4 py-2">{u.email}</td>
                  <td className="px-4 py-2 text-sm text-gray-600">
                    {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString() : "-"}
                  </td>
                  <td className="px-4 py-2">
                    <button
                      type="button"
                      onClick={() => handleDelete(u._id || u.id)}
                      className="text-red-600 hover:text-red-800"
                      disabled={loading || role !== "Admin"}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {!users.length && (
                <tr>
                  <td className="px-4 py-4 text-gray-600" colSpan={4}>
                    {loading ? "Loading..." : "No users found"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ManageUsers;
