import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import { FiMail, FiLock } from 'react-icons/fi';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await login(data);
      navigate('/');
    } catch (error) {
      const message = error?.response?.data?.message || 'Unable to login';
      alert(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.18),transparent_25%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.16),transparent_20%),linear-gradient(135deg,#020617,#0f172a)] px-4 py-10">
      <div className="w-full max-w-md rounded-[2rem] border border-slate-800 bg-slate-950/85 p-10 shadow-2xl shadow-cyan-950/40 backdrop-blur-xl">
        <div className="mb-8 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-cyan-400">Welcome back</p>
          <h1 className="mt-3 text-3xl font-semibold text-slate-100">Sign in to your account</h1>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm text-slate-300">Email</label>
            <div className="flex items-center rounded-2xl border border-slate-700 bg-slate-800/70 px-3">
              <FiMail className="text-slate-400" />
              <input {...register('email', { required: 'Email is required' })} className="w-full bg-transparent px-3 py-3 outline-none" placeholder="name@example.com" />
            </div>
            {errors.email && <p className="mt-1 text-sm text-rose-400">{errors.email.message}</p>}
          </div>
          <div>
            <label className="mb-2 block text-sm text-slate-300">Password</label>
            <div className="flex items-center rounded-2xl border border-slate-700 bg-slate-800/70 px-3">
              <FiLock className="text-slate-400" />
              <input type="password" {...register('password', { required: 'Password is required' })} className="w-full bg-transparent px-3 py-3 outline-none" placeholder="••••••••" />
            </div>
            {errors.password && <p className="mt-1 text-sm text-rose-400">{errors.password.message}</p>}
          </div>
          <button disabled={loading} className="w-full rounded-2xl bg-cyan-500 px-4 py-3 font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:opacity-70">
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <div className="mt-6 flex flex-col gap-3 text-center text-sm text-slate-400">
          <p>
            Don’t have an account? <Link className="text-cyan-400" to="/register">Create one</Link>
          </p>
          <p>
            <Link className="text-cyan-400" to="/forgot-password">Forgot password?</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
