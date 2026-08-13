const BudgetCard = ({ budget, onEdit, onDelete }) => {
  const totalBudget = Number(budget?.amount || 0);
  const spent = Number(budget?.spent || 0);
  const remaining = Number(budget?.remaining ?? totalBudget - spent);
  const percent = totalBudget > 0 ? Math.min(100, Math.round((spent / totalBudget) * 100)) : 0;
  const status = budget?.status || 'Within Budget';

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-400">{budget.monthName} {budget.year}</p>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Total Budget</p>
          <p className="text-xl font-semibold">${totalBudget.toFixed(2)}</p>
        </div>
        <div className={`rounded-full px-3 py-1 text-sm ${status === 'Budget Exceeded' ? 'bg-rose-500/20 text-rose-300' : 'bg-emerald-500/20 text-emerald-300'}`}>
          {status}
        </div>
      </div>
      <div className="mt-4 h-2.5 rounded-full bg-slate-800">
        <div className={`h-2.5 rounded-full ${status === 'Budget Exceeded' ? 'bg-rose-500' : 'bg-cyan-500'}`} style={{ width: `${percent}%` }} />
      </div>
      <div className="mt-4 flex items-center justify-between text-sm text-slate-400">
        <span>Spent: ${spent.toFixed(2)}</span>
        <span>Remaining: ${remaining.toFixed(2)}</span>
      </div>
      <div className="mt-4 flex gap-2">
        <button onClick={() => onEdit(budget)} className="rounded-xl bg-slate-800 px-3 py-2 text-sm">Edit</button>
        <button onClick={() => onDelete(budget)} className="rounded-xl bg-rose-500/20 px-3 py-2 text-sm text-rose-300">Delete</button>
      </div>
    </div>
  );
};

export default BudgetCard;
