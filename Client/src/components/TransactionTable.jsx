const TransactionTable = ({ transactions, onEdit, onDelete }) => {
  if (!transactions?.length) {
    return <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/40 p-8 text-center text-slate-400">No transactions yet.</div>;
  }

  return (
    <>
      {/* Desktop / large: table view */}
      <div className="hidden md:block overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-800/70 text-slate-300">
            <tr>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((item) => (
              <tr key={item._id} className="border-t border-slate-800/80 text-slate-200">
                <td className="px-4 py-3">
                  <div className="font-medium">{item.title}</div>
                  <div className="text-xs text-slate-400">{item.note}</div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full" style={{ backgroundColor: `${item.category?.color || '#64748b'}20`, color: item.category?.color || '#64748b' }}>
                      {item.category?.icon || '•'}
                    </span>
                    <span>{item.category?.name || 'Uncategorized'}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-1 text-xs font-semibold ${item.type === 'Income' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'}`}>
                    {item.type}
                  </span>
                </td>
                <td className="px-4 py-3 font-semibold">${Number(item.amount).toFixed(2)}</td>
                <td className="px-4 py-3">{new Date(item.date).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button onClick={() => onEdit(item)} className="rounded-lg bg-slate-800 px-3 py-2 text-xs hover:bg-slate-700">Edit</button>
                    <button onClick={() => onDelete(item)} className="rounded-lg bg-rose-500/20 px-3 py-2 text-xs text-rose-300 hover:bg-rose-500/30">Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile: stacked card view */}
      <div className="md:hidden space-y-3">
        {transactions.map((item) => (
          <div key={item._id} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-3 text-slate-200">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-start gap-3">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-md" style={{ backgroundColor: `${item.category?.color || '#64748b'}20`, color: item.category?.color || '#64748b' }}>{item.category?.icon || '•'}</div>
                  <div>
                    <div className="font-medium">{item.title}</div>
                    <div className="text-xs text-slate-400">{item.category?.name || 'Uncategorized'}</div>
                  </div>
                </div>
                {item.note && <div className="mt-2 text-xs text-slate-400">{item.note}</div>}
              </div>

              <div className="flex-shrink-0 text-right">
                <div className="text-sm font-semibold">${Number(item.amount).toFixed(2)}</div>
                <div className="mt-1 text-xs text-slate-400">{new Date(item.date).toLocaleDateString()}</div>
              </div>
            </div>

            <div className="mt-3 flex gap-2">
              <button onClick={() => onEdit(item)} className="flex-1 rounded-lg bg-slate-800 px-3 py-2 text-sm hover:bg-slate-700">Edit</button>
              <button onClick={() => onDelete(item)} className="rounded-lg bg-rose-500/20 px-3 py-2 text-sm text-rose-300 hover:bg-rose-500/30">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default TransactionTable;
