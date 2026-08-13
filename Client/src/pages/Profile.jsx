import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import {
  fetchProfile,
  updateProfile,
  changePassword,
  deleteAccount,
} from '../services/profile.service';

const Profile = () => {
  const { user, setUser } = useAuth();
  const [profile, setProfile] = useState(user);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
    },
  });

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const { data } = await fetchProfile();
        setProfile(data.user);
        reset({
          name: data.user.name || '',
          email: data.user.email || '',
        });
      } catch (error) {
        console.error(error);
      }
    };

    loadProfile();
  }, [reset]);

  const handleUpdate = async (values) => {
    setLoading(true);
    try {
      const formData = new FormData();
      if (values.name) formData.append('name', values.name);
      if (values.email) formData.append('email', values.email);
      if (values.profileImage?.[0]) {
        formData.append('profileImage', values.profileImage[0]);
      }

      const { data } = await updateProfile(formData);
      setProfile(data.user);
      setUser(data.user);
      toast.success(data.message);
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Unable to update profile.');
    } finally {
      setLoading(false);
    }
  };

  const handlePassword = async (values) => {
    setLoading(true);
    try {
      const payload = {
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      };
      const { data } = await changePassword(payload);
      toast.success(data.message);
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Unable to change password.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete your account? This cannot be undone.')) return;
    setDeleting(true);
    try {
      const { data } = await deleteAccount();
      toast.success(data.message);
      localStorage.removeItem('token');
      window.location.href = '/login';
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Unable to delete account.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.16),transparent_25%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.12),transparent_20%),linear-gradient(135deg,#020617,#0f172a)] px-4 py-10 text-slate-100">
      <div className="mx-auto w-full max-w-6xl space-y-8">
        <div className="rounded-[2rem] border border-slate-800 bg-slate-950/80 p-8 shadow-2xl shadow-cyan-950/20 backdrop-blur-xl">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-cyan-400">Profile</p>
              <h1 className="mt-3 text-4xl font-semibold text-white">Manage your account</h1>
              <p className="mt-2 max-w-2xl text-slate-400">View profile details, update email, upload a picture, change your password, or delete your account.</p>
            </div>
            <div className="flex items-center gap-4 rounded-3xl border border-slate-800 bg-slate-900/70 px-5 py-4">
              <img
                src={
                  profile?.profileImage ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.name || 'User')}&background=0D1721&color=14B8A6&size=128`
                }
                alt="Profile"
                className="h-24 w-24 rounded-full border-2 border-cyan-500 object-cover"
              />
              <div>
                <p className="text-sm text-slate-400">Joined</p>
                <p className="text-lg font-semibold text-white">{new Date(profile?.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[2rem] border border-slate-800 bg-slate-950/80 p-8 shadow-2xl shadow-cyan-950/10">
            <div className="mb-6 flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-cyan-500/10 px-4 py-2 text-sm font-medium text-cyan-300">{profile?.role?.toUpperCase()}</span>
              <span className={`rounded-full px-4 py-2 text-sm font-medium ${profile?.isActive ? 'bg-emerald-500/10 text-emerald-200' : 'bg-rose-500/10 text-rose-200'}`}>
                {profile?.isActive ? 'Active' : 'Inactive'}
              </span>
              <span className="rounded-full bg-slate-800 px-4 py-2 text-sm text-slate-300">{profile?.emailVerified ? 'Verified' : 'Unverified'}</span>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5">
                <p className="text-sm text-slate-400">Full name</p>
                <p className="mt-2 text-lg font-semibold text-white">{profile?.name || '—'}</p>
              </div>
              <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5">
                <p className="text-sm text-slate-400">Email address</p>
                <p className="mt-2 text-lg font-semibold text-white">{profile?.email || '—'}</p>
              </div>
              <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5">
                <p className="text-sm text-slate-400">Account created</p>
                <p className="mt-2 text-lg font-semibold text-white">{new Date(profile?.createdAt).toLocaleString()}</p>
              </div>
              <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5">
                <p className="text-sm text-slate-400">Status</p>
                <p className="mt-2 text-lg font-semibold text-white">{profile?.isActive ? 'Enabled' : 'Disabled'}</p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <form onSubmit={handleSubmit(handleUpdate)} className="rounded-[2rem] border border-slate-800 bg-slate-950/80 p-8 shadow-2xl shadow-cyan-950/10">
              <h2 className="text-2xl font-semibold text-white">Update profile</h2>
              <div className="mt-6 space-y-4">
                <label className="block text-sm font-medium text-slate-300">Full name</label>
                <input
                  type="text"
                  {...register('name', { required: 'Name is required.' })}
                  defaultValue={profile?.name || ''}
                  className="w-full rounded-3xl border border-slate-700 bg-slate-900 px-4 py-3 text-slate-100 outline-none focus:border-cyan-400"
                />
                {errors.name && <p className="text-sm text-rose-400">{errors.name.message}</p>}

                <label className="block text-sm font-medium text-slate-300">Email address</label>
                <input
                  type="email"
                  {...register('email', {
                    required: 'Email is required.',
                    pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Enter a valid email.' },
                  })}
                  defaultValue={profile?.email || ''}
                  className="w-full rounded-3xl border border-slate-700 bg-slate-900 px-4 py-3 text-slate-100 outline-none focus:border-cyan-400"
                />
                {errors.email && <p className="text-sm text-rose-400">{errors.email.message}</p>}

                <label className="block text-sm font-medium text-slate-300">Profile picture</label>
                <input
                  type="file"
                  accept="image/*"
                  {...register('profileImage')}
                  className="w-full rounded-3xl border border-slate-700 bg-slate-900 px-4 py-3 text-slate-100 outline-none file:mr-4 file:rounded-full file:border-0 file:bg-cyan-500 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-slate-950"
                />

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-3xl bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:opacity-70"
                >
                  {loading ? 'Saving...' : 'Save profile'}
                </button>
              </div>
            </form>

            <form onSubmit={handleSubmit(handlePassword)} className="rounded-[2rem] border border-slate-800 bg-slate-950/80 p-8 shadow-2xl shadow-cyan-950/10">
              <h2 className="text-2xl font-semibold text-white">Change password</h2>
              <div className="mt-6 space-y-4">
                <label className="block text-sm font-medium text-slate-300">Current password</label>
                <input
                  type="password"
                  {...register('currentPassword', { required: 'Current password is required.' })}
                  className="w-full rounded-3xl border border-slate-700 bg-slate-900 px-4 py-3 text-slate-100 outline-none focus:border-cyan-400"
                />
                {errors.currentPassword && <p className="text-sm text-rose-400">{errors.currentPassword.message}</p>}

                <label className="block text-sm font-medium text-slate-300">New password</label>
                <input
                  type="password"
                  {...register('newPassword', {
                    required: 'New password is required.',
                    minLength: { value: 6, message: 'Password must be at least 6 characters.' },
                  })}
                  className="w-full rounded-3xl border border-slate-700 bg-slate-900 px-4 py-3 text-slate-100 outline-none focus:border-cyan-400"
                />
                {errors.newPassword && <p className="text-sm text-rose-400">{errors.newPassword.message}</p>}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-3xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:opacity-70"
                >
                  {loading ? 'Updating...' : 'Change password'}
                </button>
              </div>
            </form>

            <div className="rounded-[2rem] border border-slate-800 bg-rose-950/80 p-8 shadow-2xl shadow-rose-950/10">
              <h2 className="text-2xl font-semibold text-white">Danger zone</h2>
              <p className="mt-3 text-sm text-slate-400">Permanently delete your account and all associated data.</p>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="mt-6 w-full rounded-3xl bg-rose-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-rose-400 disabled:opacity-70"
              >
                {deleting ? 'Deleting...' : 'Delete account'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
