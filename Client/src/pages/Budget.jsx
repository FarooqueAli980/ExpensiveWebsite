import { useEffect, useState } from 'react';
import { FiPlus } from 'react-icons/fi';
import BudgetCard from '../components/BudgetCard';
import { getBudgets, createBudget, updateBudget, deleteBudget, getBudgetSummary } from '../services/budget.service';
import { getProjects } from '../services/project.service';
import toast from 'react-hot-toast';

const getProjectId = (project) => {
  if (!project) return '';
  return typeof project === 'object' ? project._id : project;
};

const createBudgetForm = (project = '') => ({
  month: new Date().getMonth() + 1,
  year: new Date().getFullYear(),
  amount: '',
  project,
});

const Budget = () => {
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [projects, setProjects] = useState([]);
  const [formData, setFormData] = useState(createBudgetForm());

  const fetchData = async () => {
    setLoading(true);
    try {
      const projectsRes = await getProjects();
      const projectsList = projectsRes.data.projects || [];
      setProjects(projectsList);
      const defaultProject = projectsList[0]?._id || '';
      const { data } = await getBudgets();
      const withSummary = await Promise.all((data.budgets || []).map(async (item) => {
        try {
          const projectId = getProjectId(item.project);
          const summary = await getBudgetSummary(item.month, item.year, projectId);
          return { ...item, ...summary.data, monthName: new Date(item.year, item.month - 1).toLocaleString('default', { month: 'long' }) };
        } catch {
          return { ...item, spent: 0, remaining: Number(item.amount || 0), status: 'Within Budget', monthName: new Date(item.year, item.month - 1).toLocaleString('default', { month: 'long' }) };
        }
      }));
      setBudgets(withSummary);
      setFormData((current) => ({
        ...current,
        project: current.project || defaultProject,
      }));
    } catch {
      toast.error('Unable to load budgets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        month: Number(formData.month),
        year: Number(formData.year),
        amount: Number(formData.amount),
        project: formData.project || projects[0]?._id || '',
      };

      if (editingItem) {
        await updateBudget(editingItem._id, payload);
        toast.success('Budget updated');
      } else {
        await createBudget(payload);
        toast.success('Budget created');
      }

      setModalOpen(false);
      setEditingItem(null);
      setFormData((current) => ({
        ...createBudgetForm(current.project || projects[0]?._id || ''),
        month: Number(payload.month),
        year: Number(payload.year),
      }));
      fetchData();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Unable to save budget');
    }
  };

  const handleDelete = async () => {
    try {
      await deleteBudget(deleteId);
      toast.success('Budget deleted');
      setDeleteId(null);
      fetchData();
      try { window.dispatchEvent(new CustomEvent('app:dataChanged', { detail: { type: 'budget', id: deleteId } })); } catch (e) { }
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Unable to delete budget');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-3xl border border-slate-800 bg-slate-900/70 p-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-cyan-400">Budget</p>
          <h1 className="mt-2 text-3xl font-semibold">Set and track your monthly goals</h1>
        </div>
        <button onClick={() => {
          setEditingItem(null);
          setFormData((current) => ({
            ...createBudgetForm(current.project || projects[0]?._id || ''),
          }));
          setModalOpen(true);
        }} className="flex items-center justify-center gap-2 rounded-2xl bg-cyan-500 px-4 py-3 font-semibold text-slate-950">
          <FiPlus /> Set Budget
        </button>
      </div>

      {loading ? <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-40 animate-pulse rounded-2xl bg-slate-800/70" />)}</div> : <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{budgets.map((budget) => <BudgetCard key={budget._id} budget={budget} onEdit={(item) => { setEditingItem(item); setFormData({ month: item.month, year: item.year, amount: item.amount, project: getProjectId(item.project) || projects[0]?._id || '' }); setModalOpen(true); }} onDelete={(item) => setDeleteId(item._id)} />)}</div>}

      {modalOpen && (
        <div className="fixed inset-0 z-40 flex items-start sm:items-center justify-center bg-slate-950/70 p-4">
          <div className="w-full max-w-xl rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl max-h-[90vh] overflow-auto">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold">{editingItem ? 'Update Budget' : 'Create Budget'}</h2>
              <button onClick={() => { setModalOpen(false); setEditingItem(null); }} className="text-slate-400">Close</button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm text-slate-300">Month</label>
                  <select value={formData.month} onChange={(e) => setFormData({ ...formData, month: Number(e.target.value) })} className="w-full rounded-2xl border border-slate-700 bg-slate-800 px-3 py-3 outline-none">
                    {Array.from({ length: 12 }, (_, index) => <option key={index + 1} value={index + 1}>{new Date(0, index).toLocaleString('default', { month: 'long' })}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-sm text-slate-300">Year</label>
                  <input type="number" value={formData.year} onChange={(e) => setFormData({ ...formData, year: Number(e.target.value) })} className="w-full rounded-2xl border border-slate-700 bg-slate-800 px-3 py-3 outline-none" />
                </div>
              </div>
              <div>
                <label className="mb-2 block text-sm text-slate-300">Project</label>
                <select value={formData.project || ''} onChange={(e) => setFormData({ ...formData, project: e.target.value })} className="w-full rounded-2xl border border-slate-700 bg-slate-800 px-3 py-3 outline-none">
                  <option value="">Select project</option>
                  {projects.map((p) => <option key={p._id} value={p._id}>{p.name}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm text-slate-300">Budget Amount</label>
                <input type="number" step="0.01" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} className="w-full rounded-2xl border border-slate-700 bg-slate-800 px-3 py-3 outline-none" />
              </div>
              <div className="flex justify-end">
                <button className="rounded-2xl bg-cyan-500 px-4 py-3 font-semibold text-slate-950">Save Budget</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteId && (
        <div className="fixed inset-0 z-40 flex items-start sm:items-center justify-center bg-slate-950/70 p-4">
          <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900 p-6 max-h-[80vh] overflow-auto">
            <h2 className="text-xl font-semibold">Delete budget?</h2>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setDeleteId(null)} className="rounded-2xl border border-slate-700 px-4 py-2">Cancel</button>
              <button onClick={handleDelete} className="rounded-2xl bg-rose-500 px-4 py-2 text-white">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Budget;
