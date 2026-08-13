import { NavLink, useNavigate } from 'react-router-dom';
import { FiHome, FiCreditCard, FiTag, FiBarChart2, FiDollarSign, FiUser, FiShield, FiLogOut } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

const baseLinks = [
  { to: '/', label: 'Dashboard', icon: FiHome },
  { to: '/transactions', label: 'Transactions', icon: FiCreditCard },
  { to: '/projects', label: 'Projects', icon: FiTag },
  { to: '/categories', label: 'Categories', icon: FiTag },
  { to: '/reports', label: 'Reports', icon: FiBarChart2 },
  { to: '/budget', label: 'Budget', icon: FiDollarSign },
  { to: '/profile', label: 'Profile', icon: FiUser },
];

const Sidebar = ({ open, onClose }) => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const links = [...baseLinks];
  if (user?.role === 'admin') {
    links.splice(5, 0, { to: '/admin', label: 'Admin', icon: FiShield });
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {/* overlay for small screens */}
      {open && <div onClick={onClose} className="fixed inset-0 z-20 bg-black/40 lg:hidden" />}

      <aside className={`fixed inset-y-0 left-0 z-30 w-72 transform border-r border-slate-800 bg-slate-950/95 shadow-2xl transition-transform duration-300 lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`} aria-hidden={!open && 'true'}>
      <div className="flex items-center justify-between px-6 py-6">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-400">Expense Tracker</p>
          <h2 className="text-xl font-semibold tracking-tight text-slate-100">Finance System</h2>
        </div>
        <button aria-label="Close menu" className="lg:hidden rounded-full border border-slate-700 p-2 text-slate-400 transition hover:border-cyan-400 hover:text-cyan-300" onClick={onClose}>
          <FiLogOut size={20} />
        </button>
      </div>

      <nav className="space-y-1 px-3">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${isActive ? 'bg-cyan-500/20 text-cyan-400' : 'text-slate-300 hover:bg-slate-800'}`}
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
        <button onClick={handleLogout} className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-300 transition hover:bg-slate-800">
          <FiLogOut size={18} />
          Logout
        </button>
      </nav>
    </aside>
    </>
  );
};

export default Sidebar;
