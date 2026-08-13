import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { forgotPassword } from '../services/auth.service';

const ForgotPassword = () => {
  const [loading, setLoading] = useState(false);
  const [info, setInfo] = useState(null);
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async ({ email }) => {
    setLoading(true);
    setInfo(null);

    try {
      const { data } = await forgotPassword({ email });
      toast.success(data.message || 'Check your email for reset instructions.');
      setInfo(data.resetUrl ? `Reset link: ${data.resetUrl}` : 'Check your email for instructions.');
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Unable to send password reset email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.18),transparent_25%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.16),transparent_20%),linear-gradient(135deg,#020617,#0f172a)] px-4 py-10">
      <div className="w-full max-w-md rounded-[2rem] border border-slate-800 bg-slate-950/85 p-10 shadow-2xl shadow-cyan-950/40 backdrop-blur-xl">
        <div className="mb-8 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-cyan-400">Forgot Password</p>
          <h1 className="mt-3 text-3xl font-semibold text-slate-100">Reset your password</h1>
          <p className="mt-3 text-sm text-slate-400">Enter your email and we’ll send a reset link.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm text-slate-300">Email</label>
            <input
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: 'Enter a valid email',
                },
              })}
              className="w-full rounded-2xl border border-slate-700 bg-slate-800/70 px-3 py-3 text-slate-100 outline-none"
              placeholder="name@example.com"
            />
            {errors.email && <p className="mt-1 text-sm text-rose-400">{errors.email.message}</p>}
          </div>

          <button disabled={loading} className="w-full rounded-2xl bg-cyan-500 px-4 py-3 font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:opacity-70">
            {loading ? 'Sending...' : 'Send reset link'}
          </button>
        </form>

        {info && (
          <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900/70 p-4 text-sm text-slate-200">
            {info}
          </div>
        )}

        <p className="mt-6 text-center text-sm text-slate-400">
          Remember your password? <Link className="text-cyan-400" to="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
