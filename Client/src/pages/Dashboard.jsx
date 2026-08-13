import { useEffect, useState } from 'react';
import { FiDollarSign, FiTrendingUp, FiTrendingDown, FiCreditCard } from 'react-icons/fi';
import DashboardCard from '../components/DashboardCard';
import TransactionTable from '../components/TransactionTable';
import IncomeExpenseChart from '../components/Charts/IncomeExpenseChart';
import ExpenseCategoryChart from '../components/Charts/ExpenseCategoryChart';
import MonthlyChart from '../components/Charts/MonthlyChart';
import { getDashboardSummary, getRecentTransactions, getIncomeExpense, getMonthlyAnalytics, getExpenseByCategory } from '../services/dashboard.service';
import { getBudgetSummary } from '../services/budget.service';
import { exportPdf, exportExcel, exportCsv, downloadBlob } from '../services/export.service';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const [summary, setSummary] = useState(null);
  const [recent, setRecent] = useState([]);
  const [incomeExpense, setIncomeExpense] = useState({ income: 0, expense: 0 });
  const [monthly, setMonthly] = useState([]);
  const [expenseCategories, setExpenseCategories] = useState([]);
  const [budget, setBudget] = useState(null);
  const [loading, setLoading] = useState(true);

  const handleExport = async (format) => {
    try {
      const params = {
        reportType: 'monthly',
        title: 'Monthly Dashboard Report',
      };
      const response = format === 'pdf'
        ? await exportPdf(params)
        : format === 'excel'
          ? await exportExcel(params)
          : await exportCsv(params);

      const blob = new Blob([response.data], { type: response.headers['content-type'] });
      const contentDisposition = response.headers['content-disposition'] || response.headers['Content-Disposition'] || '';
      const filenameMatch = contentDisposition.match(/filename="?([^";]+)"?/);
      const filename = filenameMatch ? filenameMatch[1] : `dashboard-report.${format === 'excel' ? 'xlsx' : format}`;
      downloadBlob(blob, filename);
      toast.success('Dashboard export started');
    } catch (error) {
      console.error(error);
      toast.error('Unable to export dashboard report');
    }
  };

  // fetchData is used on mount and when data changes elsewhere in the app
  const fetchData = async () => {
    setLoading(true);
    try {
      const [summaryRes, recentRes, incomeExpenseRes, monthlyRes, expenseRes, budgetRes] = await Promise.all([
        getDashboardSummary(),
        getRecentTransactions(),
        getIncomeExpense(),
        getMonthlyAnalytics(),
        getExpenseByCategory(),
        getBudgetSummary(new Date().getMonth() + 1, new Date().getFullYear()).catch(() => null),
      ]);
      setSummary(summaryRes.data.summary);
      setRecent(recentRes.data.transactions || []);
      setIncomeExpense(incomeExpenseRes.data || { income: 0, expense: 0 });
      setMonthly(monthlyRes.data.monthly || []);
      setExpenseCategories(expenseRes.data.expenses || []);
      setBudget(budgetRes?.data || null);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Listen for global data changes (deletes/creates/updates elsewhere)
    const handler = () => fetchData();
    window.addEventListener('app:dataChanged', handler);
    return () => window.removeEventListener('app:dataChanged', handler);
  }, []);

  if (loading) {
    return <div className="space-y-4"><div className="h-24 animate-pulse rounded-2xl bg-slate-800/70" /><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-32 animate-pulse rounded-2xl bg-slate-800/70" />)}</div></div>;
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-800 bg-slate-950/85 p-6 shadow-2xl">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-cyan-400">Overview</p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-100">Your financial dashboard</h1>
            <p className="mt-2 text-slate-400">Stay on top of cash flow, expenses, and monthly goals.</p>
          </div>
          <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 px-4 py-3 text-sm text-cyan-300 backdrop-blur">
            {budget ? `Monthly budget: ${budget.status}` : 'No budget set'}
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <DashboardCard title="Total Balance" value={`$${(summary?.balance || 0).toFixed(2)}`} subtitle="Net cash flow" type="balance" icon={FiDollarSign} />
        <DashboardCard title="Total Income" value={`$${(summary?.totalIncome || 0).toFixed(2)}`} subtitle="All incoming funds" type="income" icon={FiTrendingUp} />
        <DashboardCard title="Total Expense" value={`$${(summary?.totalExpense || 0).toFixed(2)}`} subtitle="All outgoing funds" type="expense" icon={FiTrendingDown} />
        <DashboardCard title="Monthly Budget" value={budget ? `$${budget.remaining.toFixed(2)}` : '$0.00'} subtitle={budget ? `${budget.spent.toFixed(2)} spent` : 'Set a monthly goal'} type="default" icon={FiCreditCard} />
      </div>
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-slate-400">Quick dashboard export</p>
            <p className="text-lg font-semibold text-slate-100">Download monthly summary</p>
          </div>
          <div className="grid gap-2 sm:grid-cols-3">
            <button onClick={() => handleExport('pdf')} className="rounded-2xl bg-cyan-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400">
              Export PDF
            </button>
            <button onClick={() => handleExport('excel')} className="rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400">
              Export Excel
            </button>
            <button onClick={() => handleExport('csv')} className="rounded-2xl bg-slate-700 px-4 py-3 text-sm font-semibold text-slate-100 transition hover:bg-slate-600">
              Export CSV
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
        <div className="space-y-6">
          <IncomeExpenseChart data={incomeExpense} />
          <MonthlyChart data={monthly} />
        </div>
        <div className="space-y-6">
          <ExpenseCategoryChart data={expenseCategories} />
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
            <h3 className="mb-4 text-lg font-semibold">Recent Transactions</h3>
            <TransactionTable transactions={recent} onEdit={() => {}} onDelete={() => {}} />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-cyan-400">Project progress</p>
            <h2 className="text-xl font-semibold text-slate-100">Active projects at a glance</h2>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {summary?.projects?.length ? summary.projects.map((project) => (
            <div key={project.projectId} className="rounded-3xl border border-slate-800 bg-slate-950/70 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm text-slate-400">{project.name}</p>
                  <p className="mt-2 text-xl font-semibold text-slate-100">${project.totalSpent.toFixed(2)} / ${project.totalBudget.toFixed(2)}</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${project.status === 'Budget Exceeded' ? 'bg-rose-500/20 text-rose-300' : project.status === 'Near Limit' ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-500/20 text-emerald-300'}`}>{project.status}</span>
              </div>
              <div className="mt-4 h-2.5 rounded-full bg-slate-800">
                <div className="h-2.5 rounded-full bg-cyan-500" style={{ width: `${project.utilization}%` }} />
              </div>
              <div className="mt-3 flex items-center justify-between text-sm text-slate-400">
                <span>{project.utilization}% used</span>
                <span>{project.totalSpent.toFixed(2)} spent</span>
              </div>
            </div>
          )) : (
            <div className="rounded-3xl border border-dashed border-slate-700 bg-slate-900/70 p-8 text-center text-slate-400">No active project progress available.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
