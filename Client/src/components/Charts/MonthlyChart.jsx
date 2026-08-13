import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const formatCurrency = (v) => `$${Number(v || 0).toFixed(2)}`;

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="rounded-md bg-slate-800/95 p-3 text-sm text-slate-100 border border-slate-700">
      <div className="font-semibold">{label}</div>
      <div className="mt-1">{formatCurrency(payload[0].value)}</div>
    </div>
  );
};

const MonthlyChart = ({ data = [] }) => {
  const chartData = data.map((item) => ({
    month: monthNames[(item._id.month || 1) - 1] || `M${item._id.month}`,
    value: item.total,
  }));

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold">Monthly Analytics</h3>
        <div className="text-sm text-slate-400">Trends</div>
      </div>

      <div className="h-52 sm:h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 6, right: 6, left: -12, bottom: 6 }}>
            <defs>
              <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.25} />
                <stop offset="100%" stopColor="#06b6d4" stopOpacity={0.04} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#0f172a" />
            <XAxis dataKey="month" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 12 }} />
            <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 12 }} />
            <Tooltip content={<CustomTooltip />} wrapperStyle={{ outline: 'none' }} />
            <Area type="monotone" dataKey="value" stroke="#06b6d4" strokeWidth={2.5} fill="url(#grad)" isAnimationActive animationDuration={900} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default MonthlyChart;
