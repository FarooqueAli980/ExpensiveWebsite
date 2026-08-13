import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

// Use two complementary colors and alternate them for slices
const PRIMARY = '#06b6d4'; // teal
const SECONDARY = '#f59e0b'; // amber

const getSliceColor = (index) => (index % 2 === 0 ? PRIMARY : SECONDARY);

const formatCurrency = (v) => `$${Number(v || 0).toFixed(2)}`;

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload || !payload.length) return null;
  const p = payload[0];
  return (
    <div className="rounded-md bg-slate-800/95 p-3 text-sm text-slate-100 border border-slate-700">
      <div className="font-semibold">{p.name}</div>
      <div className="mt-1">{formatCurrency(p.value)}</div>
    </div>
  );
};

const ExpenseCategoryChart = ({ data = [] }) => {
  const chartData = data.map((item) => ({
    name: item.category?.name || 'Category',
    value: item.total,
  }));

  const total = chartData.reduce((s, c) => s + Number(c.value || 0), 0);

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
      <div className="mb-4 flex items-start justify-between">
        <h3 className="text-lg font-semibold">Expense by Category</h3>
        <div className="text-sm text-slate-400">Breakdown</div>
      </div>

      <div className="h-56 sm:h-72">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={48}
              outerRadius={88}
              paddingAngle={2}
              isAnimationActive
              animationDuration={900}
            >
              {chartData.map((entry, index) => (
                <Cell key={entry.name} fill={getSliceColor(index)} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} wrapperStyle={{ outline: 'none' }} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 max-h-40 overflow-y-auto pr-2">
        {chartData.map((c, i) => (
          <div key={c.name} className="flex items-center justify-between gap-4 py-2 border-b border-slate-800/50">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-3 w-6 rounded-md" style={{ background: getSliceColor(i) }} />
              <div>
                <div className="text-sm text-slate-100 font-medium">{c.name}</div>
                <div className="text-xs text-slate-400">{formatCurrency(c.value)}</div>
              </div>
            </div>
            <div className="text-sm text-slate-400">{total ? `${Math.round((c.value / total) * 100)}%` : '0%'}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExpenseCategoryChart;
