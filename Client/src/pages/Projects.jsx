import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPlus } from 'react-icons/fi';
import { getProjects, createProject, updateProject, deleteProject } from '../services/project.service';
import toast from 'react-hot-toast';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', budget: '', startDate: new Date().toISOString().slice(0, 10), endDate: '', status: 'Active' });

  const fetch = async () => {
    setLoading(true);
    try {
      const { data } = await getProjects();
      setProjects(data.projects || []);
    } catch (err) {
      toast.error('Unable to load projects');
    } finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    try {
      if (editing) await updateProject(editing._id, form);
      else await createProject(form);
      toast.success('Saved');
      setModalOpen(false);
      setEditing(null);
      setForm({ name: '', description: '', budget: '', startDate: new Date().toISOString().slice(0, 10), endDate: '', status: 'Active' });
      fetch();
    } catch (err) { toast.error('Unable to save project'); }
  };

  const remove = async (id) => {
    try {
      await deleteProject(id);
      toast.success('Deleted');
      fetch();
      notifyChange(id);
    } catch {
      toast.error('Unable to delete');
    }
  };
  
  // notify dashboard when projects change
  const notifyChange = (id) => {
    try { window.dispatchEvent(new CustomEvent('app:dataChanged', { detail: { type: 'project', id } })); } catch (e) { }
  };

  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-3xl border border-slate-800 bg-slate-900/70 p-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-cyan-400">Projects</p>
          <h1 className="mt-2 text-3xl font-semibold">Manage your projects / businesses</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-400">Track each project as a weekly budget journey and review progress by week, month, and spend status.</p>
        </div>
        <button onClick={() => { setEditing(null); setForm({ name: '', description: '', budget: '', startDate: new Date().toISOString().slice(0, 10), endDate: '', status: 'Active' }); setModalOpen(true); }} className="flex items-center gap-2 rounded-2xl bg-cyan-500 px-4 py-3 font-semibold text-slate-950"><FiPlus /> New Project</button>
      </div>

      {loading ? <div className="h-48 animate-pulse rounded-2xl bg-slate-800/70" /> : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {projects.map(p => (
            <div key={p._id} className="group rounded-2xl border border-slate-800 bg-slate-900/70 p-5 transition hover:border-cyan-500/60">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <button type="button" onClick={() => navigate(`/projects/${p._id}`)} className="text-left">
                    <h3 className="text-xl font-semibold text-slate-100 transition group-hover:text-cyan-300">{p.name}</h3>
                  </button>
                  <p className="mt-2 text-sm text-slate-400">{p.description || 'No description yet.'}</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${p.status === 'Active' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-700 text-slate-200'}`}>{p.status}</span>
              </div>
              <div className="mt-4 space-y-2 text-sm text-slate-300">
                <div>Budget: <span className="font-semibold text-slate-100">${Number(p.budget || 0).toFixed(2)}</span></div>
                <div>Start: <span className="font-semibold text-slate-100">{p.startDate ? new Date(p.startDate).toLocaleDateString() : 'Not set'}</span></div>
                <div>End: <span className="font-semibold text-slate-100">{p.endDate ? new Date(p.endDate).toLocaleDateString() : 'Auto 28 days'}</span></div>
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                <button onClick={() => navigate(`/projects/${p._id}`)} className="rounded-2xl bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950">View timeline</button>
                <button onClick={() => {
                  setEditing(p);
                  setForm({
                    name: p.name,
                    description: p.description || '',
                    budget: p.budget || '',
                    startDate: p.startDate ? new Date(p.startDate).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
                    endDate: p.endDate ? new Date(p.endDate).toISOString().slice(0, 10) : '',
                    status: p.status || 'Active',
                  });
                  setModalOpen(true);
                }} className="rounded-2xl bg-slate-800 px-4 py-2 text-sm">Edit</button>
                <button onClick={() => remove(p._id)} className="rounded-2xl bg-rose-500/20 px-4 py-2 text-sm text-rose-300">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/70 p-4">
          <div className="w-full max-w-xl rounded-3xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-xl font-semibold mb-4">{editing ? 'Edit Project' : 'Create Project'}</h2>
            <form onSubmit={submit} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm text-slate-300">Name</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full rounded-2xl border border-slate-700 bg-slate-800 px-3 py-3 outline-none" />
              </div>
              <div>
                <label className="mb-2 block text-sm text-slate-300">Status</label>
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full rounded-2xl border border-slate-700 bg-slate-800 px-3 py-3 outline-none">
                  <option value="Active">Active</option>
                  <option value="Paused">Paused</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>
            <div>
              <label className="mb-2 block text-sm text-slate-300">Description</label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full rounded-2xl border border-slate-700 bg-slate-800 px-3 py-3 outline-none" />
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label className="mb-2 block text-sm text-slate-300">Budget</label>
                <input type="number" step="0.01" value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} className="w-full rounded-2xl border border-slate-700 bg-slate-800 px-3 py-3 outline-none" />
              </div>
              <div>
                <label className="mb-2 block text-sm text-slate-300">Start Date</label>
                <input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} className="w-full rounded-2xl border border-slate-700 bg-slate-800 px-3 py-3 outline-none" />
              </div>
              <div>
                <label className="mb-2 block text-sm text-slate-300">End Date</label>
                <input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} className="w-full rounded-2xl border border-slate-700 bg-slate-800 px-3 py-3 outline-none" />
              </div>
            </div>
              <div className="flex justify-end">
                <button className="rounded-2xl bg-cyan-500 px-4 py-3 font-semibold text-slate-950">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;
