import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiArrowLeft, FiCalendar, FiDollarSign, FiTrendingUp, FiList } from 'react-icons/fi';
import { getProjectSummary, getProjectById } from '../services/project.service';
import TransactionTable from '../components/TransactionTable';
import toast from 'react-hot-toast';

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [summary, setSummary] = useState(null);
  const [weeks, setWeeks] = useState([]);
  const [monthlySummary, setMonthlySummary] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadSummary = async () => {
    setLoading(true);
    try {
      const [{ data: projectData }, { data: summaryData }] = await Promise.all([
        getProjectById(id),
        getProjectSummary(id),
      ]);
      setProject(projectData.project);
      setSummary(summaryData.summary);
      setWeeks(summaryData.weeks || []);
      setMonthlySummary(summaryData.monthlySummary || []);
      setRecentTransactions(summaryData.recentTransactions || []);
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Unable to load project summary');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSummary();
  }, [id]);

  const targetAmount = summary?.weeklyTarget || 0;
  const currentWeek = summary?.currentWeek || 'Upcoming';
  const utilization = summary?.utilization || 0;

  const weekCards = useMemo(() => weeks.map((week) => {
    const progress = targetAmount > 0 ? Math.min(100, Math.round((week.spent / targetAmount) * 100)) : 0;
    return (
      <div key={week.weekIndex} className={`rounded-3xl border p-4 ${week.label === currentWeek ? 'border-cyan-500/60 bg-cyan-500/5' : 'border-slate-800 bg-slate-950/80'}`}>
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm text-slate-400">{week.label}</p>
            <p className="mt-1 text-lg font-semibold text-slate-100">${week.spent.toFixed(2)}</p>
          </div>
          <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-300">{week.transactionCount} tx</span>
        </div>
        <div className="mt-4 h-2.5 rounded-full bg-slate-800">
          <div className="h-2.5 rounded-full bg-cyan-500" style={{ width: `${progress}%` }} />
        </div>
        <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
          <span>{progress}% of weekly goal</span>
          <span>{new Date(week.start).toLocaleDateString()} - {new Date(week.end).toLocaleDateString()}</span>
        </div>
      </div>
    );
  }), [weeks, targetAmount, currentWeek]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-3xl border border-slate-800 bg-slate-900/70 p-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <button type="button" onClick={() => navigate('/projects')} className="mb-4 inline-flex items-center gap-2 rounded-2xl border border-slate-700 bg-slate-950/80 px-4 py-2 text-sm text-slate-300 transition hover:border-cyan-500/40 hover:text-cyan-300">
            <FiArrowLeft /> Back to projects
          </button>
          <p className="text-sm uppercase tracking-[0.3em] text-cyan-400">Project timeline</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-100">{project?.name || 'Project details'}</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-400">Weekly progress tracking for the active project with budget, spend, and remaining insights.</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-3xl border border-slate-800 bg-slate-950/70 p-4">
            <div className="flex items-center gap-3 text-slate-400"><FiDollarSign /> Total Budget</div>
            <p className="mt-3 text-3xl font-semibold text-slate-100">${summary?.totalBudget?.toFixed(2) || '0.00'}</p>
          </div>
          <div className="rounded-3xl border border-slate-800 bg-slate-950/70 p-4">
            <div className="flex items-center gap-3 text-slate-400"><FiTrendingUp /> Remaining</div>
            <p className="mt-3 text-3xl font-semibold text-slate-100">${summary?.remaining?.toFixed(2) || '0.00'}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-3xl border border-slate-800 bg-slate-950/70 p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-cyan-400">Week progress</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-100">{currentWeek}</h2>
              <p className="mt-1 text-sm text-slate-400">Weekly target: ${targetAmount.toFixed(2)}</p>
            </div>
            <div className="rounded-3xl bg-slate-900/80 px-4 py-3 text-right">
              <p className="text-sm text-slate-400">Overall utilization</p>
              <p className="mt-2 text-3xl font-semibold text-slate-100">{utilization}%</p>
            </div>
          </div>
          <div className="mt-5 grid gap-4 lg:grid-cols-2">{weekCards}</div>
        </div>

        <div className="space-y-4">
          <div className="rounded-3xl border border-slate-800 bg-slate-950/70 p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-cyan-400">Monthly summary</p>
                <h2 className="mt-2 text-xl font-semibold text-slate-100">Budget vs spend</h2>
              </div>
              <FiCalendar className="text-slate-400" />
            </div>
            <div className="mt-5 space-y-3">
              {monthlySummary.map((item) => (
                <div key={`${item.year}-${item.month}`} className="rounded-3xl border border-slate-800 bg-slate-900/70 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-slate-100">{item.label}</h3>
                      <p className="text-sm text-slate-400">{item.status}</p>
                    </div>
                    <div className="text-right text-sm text-slate-300">
                      <p>Budget: ${item.budget.toFixed(2)}</p>
                      <p>Spent: ${item.spent.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-950/70 p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-cyan-400">Recent activity</p>
                <h2 className="mt-2 text-xl font-semibold text-slate-100">Expenses this project</h2>
              </div>
              <FiList className="text-slate-400" />
            </div>
            <div className="mt-5">
              <TransactionTable transactions={recentTransactions} onEdit={() => {}} onDelete={() => {}} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetail;
