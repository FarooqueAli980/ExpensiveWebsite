import { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { resetPassword } from '../services/auth.service';

const ResetPassword = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { token } = useParams();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const onSubmit = async ({ password }) => {
    setLoading(true);
    try {
      await resetPassword(token, { password });
      toast.success('Password reset successfully. Please log in.');
      navigate('/login');
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Password reset failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.18),transparent_25%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.16),transparent_20%),linear-gradient(135deg,#020617,#0f172a)] px-4 py-10">
      <div className="w-full max-w-md rounded-[2rem] border border-slate-800 bg-slate-950/85 p-10 shadow-2xl shadow-cyan-950/40 backdrop-blur-xl">
        <div className="mb-8 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-cyan-400">Reset Password</p>
          <h1 className="mt-3 text-3xl font-semibold text-slate-100">Create a new password</h1>
          <p className="mt-3 text-sm text-slate-400">Enter your new password to recover access.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm text-slate-300">New Password</label>
            <input
              type="password"
              {...register('password', {
                required: 'Password is required',
                minLength: { value: 6, message: 'At least 6 characters' },
              })}
              className="w-full rounded-2xl border border-slate-700 bg-slate-800/70 px-3 py-3 text-slate-100 outline-none"
              placeholder="••••••••"
            />
            {errors.password && <p className="mt-1 text-sm text-rose-400">{errors.password.message}</p>}
          </div>

          <div>
            <label className="mb-2 block text-sm text-slate-300">Confirm Password</label>
            <input
              type="password"
              {...register('confirmPassword', {
                required: 'Please confirm your password',
                validate: (value) => value === watch('password') || 'Passwords must match',
              })}
              className="w-full rounded-2xl border border-slate-700 bg-slate-800/70 px-3 py-3 text-slate-100 outline-none"
              placeholder="••••••••"
            />
            {errors.confirmPassword && <p className="mt-1 text-sm text-rose-400">{errors.confirmPassword.message}</p>}
          </div>

          <button disabled={loading} className="w-full rounded-2xl bg-cyan-500 px-4 py-3 font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:opacity-70">
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-400">
          Remembered it? <Link className="text-cyan-400" to="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
};

export default ResetPassword;
