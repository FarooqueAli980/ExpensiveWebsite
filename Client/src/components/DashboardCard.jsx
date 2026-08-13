import { FiArrowUpRight, FiArrowDownRight } from 'react-icons/fi';

const DashboardCard = ({ title, value, subtitle, type = 'default', icon: Icon }) => {
  const styles = {
    balance: 'from-cyan-500/20 to-cyan-400/10 text-cyan-300',
    income: 'from-emerald-500/20 to-emerald-400/10 text-emerald-300',
    expense: 'from-rose-500/20 to-rose-400/10 text-rose-300',
    default: 'from-slate-700/60 to-slate-800/40 text-slate-200',
  };

  return (
    <div className={`rounded-2xl border border-slate-800 bg-gradient-to-br ${styles[type]} p-5 shadow-lg`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-400">{title}</p>
          <p className="mt-2 text-2xl font-semibold">{value}</p>
          <p className="mt-2 text-sm text-slate-400">{subtitle}</p>
        </div>
        {Icon && (
          <div className="rounded-xl bg-slate-900/70 p-3">
            <Icon size={20} />
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardCard;
