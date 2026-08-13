import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell, LabelList } from 'recharts';

const COLORS = ['#06b6d4', '#ef4444']; // teal and rose-red for contrast

const formatCurrency = (v) => `$${Number(v || 0).toFixed(2)}`;

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload || !payload.length) return null;
  const item = payload[0].payload;
  return (
    <div className="rounded-md bg-slate-800/95 p-3 text-sm text-slate-100 border border-slate-700">
      <div className="font-semibold">{item.name}</div>
      <div className="mt-1">{formatCurrency(item.value)}</div>
    </div>
  );
};

const IncomeExpenseChart = ({ data }) => {
  const chartData = [
    { name: 'Income', value: data?.income || 0 },
    { name: 'Expense', value: data?.expense || 0 },
  ];

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
      <div className="mb-4 flex items-start justify-between">
        <h3 className="text-lg font-semibold">Income vs Expense</h3>
        <div className="text-sm text-slate-400">Comparison</div>
      </div>

      <div className="mb-3 flex flex-wrap gap-3">
        {chartData.map((c, i) => (
          <div key={c.name} className="flex items-center gap-3">
            <span className="inline-flex h-3 w-6 rounded-md" style={{ background: COLORS[i % COLORS.length] }} />
            <div>
              <div className="text-sm text-slate-400">{c.name}</div>
              <div className="text-sm font-semibold text-slate-100">{formatCurrency(c.value)}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="h-52 sm:h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} barCategoryGap="30%">
            <CartesianGrid strokeDasharray="3 3" stroke="#0f172a" />
            <XAxis dataKey="name" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 12 }} />
            <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 12 }} />
            <Tooltip content={<CustomTooltip />} wrapperStyle={{ outline: 'none' }} />
            <Bar dataKey="value" maxBarSize={48} isAnimationActive animationDuration={800} animationEasing="ease-out">
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} radius={8} />
              ))}
              <LabelList dataKey="value" position="top" formatter={(v) => formatCurrency(v)} style={{ fill: '#cbd5e1', fontSize: 12 }} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default IncomeExpenseChart;
