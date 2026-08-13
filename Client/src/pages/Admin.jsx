import { useEffect, useState } from 'react';
import { FiSearch, FiShield, FiUser, FiUserCheck, FiUserX, FiUsers } from 'react-icons/fi';
import { getAdminStats, getAdminUsers, updateAdminUser } from '../services/admin.service';
import toast from 'react-hot-toast';

const Admin = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);

  const fetchAdminData = async (query = '') => {
    setLoading(true);
    try {
      const [statsRes, usersRes] = await Promise.all([
        getAdminStats(),
        getAdminUsers({ search: query }),
      ]);

      setStats(statsRes.data.stats);
      setUsers(usersRes.data.users || []);
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Unable to load admin data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleSearch = async (event) => {
    event.preventDefault();
    fetchAdminData(search);
  };

  const handleUpdateUser = async (user, updates) => {
    setSavingId(user._id);
    try {
      await updateAdminUser(user._id, updates);
      toast.success('User updated successfully');
      fetchAdminData(search);
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Unable to update user');
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-800 bg-slate-950/85 p-6 shadow-2xl">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-cyan-400">Admin Panel</p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-100">User management and system overview</h1>
            <p className="mt-2 text-slate-400">Monitor accounts, manage access, and review platform usage.</p>
          </div>
          <form onSubmit={handleSearch} className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-3">
            <FiSearch className="text-slate-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search users by name or email"
              className="w-full bg-transparent text-sm outline-none placeholder:text-slate-500"
            />
            <button type="submit" className="rounded-2xl bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950">Search</button>
          </form>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-32 animate-pulse rounded-3xl bg-slate-900/70" />
          ))
        ) : (
          [
            { label: 'Total users', value: stats?.totalUsers ?? 0, icon: FiUsers },
            { label: 'Active accounts', value: stats?.activeUsers ?? 0, icon: FiUserCheck },
            { label: 'Inactive accounts', value: stats?.inactiveUsers ?? 0, icon: FiUserX },
            { label: 'Admin users', value: stats?.adminUsers ?? 0, icon: FiShield },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
              <div className="flex items-start gap-4">
                <div className="rounded-2xl bg-cyan-500/10 p-3 text-cyan-300">
                  <Icon size={22} />
                </div>
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-slate-400">{label}</p>
                  <p className="mt-4 text-3xl font-semibold text-slate-100">{value}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-100">User accounts</h2>
            <p className="mt-2 text-slate-400">Review and manage users with admin controls.</p>
          </div>
          <p className="text-sm text-slate-500">{users.length} users found</p>
        </div>

        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full text-left text-sm text-slate-300">
            <thead className="border-b border-slate-800 text-slate-500">
              <tr>
                <th className="px-4 py-4">Name</th>
                <th className="px-4 py-4">Email</th>
                <th className="px-4 py-4">Role</th>
                <th className="px-4 py-4">Status</th>
                <th className="px-4 py-4">Joined</th>
                <th className="px-4 py-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <tr key={index} className="border-b border-slate-800">
                    <td colSpan="6" className="px-4 py-4">
                      <div className="h-6 w-full animate-pulse rounded-full bg-slate-800/70" />
                    </td>
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr className="border-b border-slate-800">
                  <td colSpan="6" className="px-4 py-8 text-center text-slate-500">No users available.</td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user._id} className="border-b border-slate-800 hover:bg-slate-950/50">
                    <td className="px-4 py-4 font-semibold text-slate-100">{user.name}</td>
                    <td className="px-4 py-4">{user.email}</td>
                    <td className="px-4 py-4 capitalize">{user.role}</td>
                    <td className="px-4 py-4">{user.isActive ? 'Active' : 'Inactive'}</td>
                    <td className="px-4 py-4">{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-4 space-x-2">
                      <button
                        disabled={savingId === user._id}
                        onClick={() => handleUpdateUser(user, { isActive: !user.isActive })}
                        className="rounded-2xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-medium text-slate-200 transition hover:border-cyan-400 hover:text-cyan-300 disabled:opacity-60"
                      >
                        {user.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        disabled={savingId === user._id}
                        onClick={() => handleUpdateUser(user, { role: user.role === 'admin' ? 'user' : 'admin' })}
                        className="rounded-2xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-medium text-slate-200 transition hover:border-emerald-400 hover:text-emerald-300 disabled:opacity-60"
                      >
                        Make {user.role === 'admin' ? 'User' : 'Admin'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Admin;
