import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/axios';

const VerifyEmail = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState(null);

  useEffect(() => {
    const verify = async () => {
      try {
        const { data } = await api.get(`/auth/verify-email/${token}`);
        setStatus({ type: 'success', message: data.message });
        toast.success(data.message);
        setTimeout(() => navigate('/login'), 2500);
      } catch (error) {
        const message = error?.response?.data?.message || 'Email verification failed.';
        setStatus({ type: 'error', message });
        toast.error(message);
        setLoading(false);
      }
    };

    verify();
  }, [token, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.18),transparent_25%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.16),transparent_20%),linear-gradient(135deg,#020617,#0f172a)] px-4 py-10">
      <div className="w-full max-w-md rounded-[2rem] border border-slate-800 bg-slate-950/85 p-10 shadow-2xl shadow-cyan-950/40 backdrop-blur-xl text-center">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-cyan-400">Verify Email</p>
          <h1 className="mt-3 text-3xl font-semibold text-slate-100">Email verification</h1>
        </div>

        {loading ? (
          <p className="text-slate-300">Verifying your email…</p>
        ) : status ? (
          <div>
            <p className={`rounded-2xl border px-4 py-3 text-sm ${status.type === 'success' ? 'border-emerald-500 bg-emerald-500/10 text-emerald-300' : 'border-rose-500 bg-rose-500/10 text-rose-300'}`}>
              {status.message}
            </p>
            {status.type === 'error' && (
              <Link className="mt-6 inline-block rounded-2xl bg-cyan-500 px-6 py-3 text-sm font-semibold text-slate-950" to="/resend-verification">
                Resend verification email
              </Link>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default VerifyEmail;
