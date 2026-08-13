import { FiBell, FiMenu } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

const Navbar = ({ onMenuClick }) => {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-20 border-b border-slate-800 bg-slate-950/90 shadow-sm backdrop-blur-xl">
      <div className="flex items-center justify-between px-4 py-4 sm:px-6">
        <button aria-label="Open menu" className="rounded-2xl p-2 text-slate-300 transition hover:bg-slate-900/70 hover:text-white lg:hidden" onClick={onMenuClick}>
          <FiMenu size={20} />
        </button>
        <div>
          <p className="text-sm text-slate-400">Welcome back</p>
          <h1 className="text-lg font-semibold tracking-tight text-slate-100">{user?.name || 'User'}</h1>
        </div>
        <div className="flex items-center gap-2">
          <button className="rounded-2xl p-2 bg-slate-900/80 text-slate-200 transition hover:bg-slate-800">
            <FiBell size={18} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
