const NotFound = () => (
  <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 px-6 text-center">
    <p className="text-sm font-semibold uppercase tracking-[0.35em] text-cyan-400">404</p>
    <h1 className="mt-3 text-4xl font-semibold">Page not found</h1>
    <p className="mt-3 max-w-md text-slate-400">The page you’re looking for doesn’t exist or might have moved.</p>
    <a href="/" className="mt-6 rounded-2xl bg-cyan-500 px-4 py-3 font-semibold text-slate-950">Go Home</a>
  </div>
);

export default NotFound;
