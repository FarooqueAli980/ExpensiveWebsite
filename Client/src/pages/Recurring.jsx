import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import recurringService from '../services/recurring.service';
import { getCategories } from '../services/category.service';

const Recurring = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);

  const { register, handleSubmit, reset } = useForm({
    defaultValues: { frequency: 'Monthly', type: 'Expense', status: 'Active' },
  });

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await recurringService.getRecurrings();
      setItems(data.recurrings || []);
      const cats = await getCategories();
      setCategories(cats.data.categories || []);
    } catch (err) {
      toast.error('Unable to load recurring transactions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onSubmit = async (payload) => {
    try {
      await recurringService.createRecurring(payload);
      toast.success('Recurring created');
      reset();
      load();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Create failed');
    }
  };

  const handlePause = async (id) => {
    try {
      await recurringService.pauseRecurring(id);
      load();
    } catch (err) {
      toast.error('Unable to pause');
    }
  };

  const handleResume = async (id) => {
    try {
      await recurringService.resumeRecurring(id);
      load();
    } catch (err) {
      toast.error('Unable to resume');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this recurring transaction?')) return;
    try {
      await recurringService.deleteRecurring(id);
      load();
      try { window.dispatchEvent(new CustomEvent('app:dataChanged', { detail: { type: 'recurring', id } })); } catch (e) { }
    } catch (err) {
      toast.error('Unable to delete');
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">Recurring Transactions</h2>
      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 bg-slate-900 p-4 rounded">
          <input {...register('title', { required: true })} placeholder="Title" className="w-full px-3 py-2 rounded" />
          <input {...register('amount', { required: true })} placeholder="Amount" type="number" className="w-full px-3 py-2 rounded" />
          <select {...register('type')} className="w-full px-3 py-2 rounded">
            <option>Expense</option>
            <option>Income</option>
          </select>
          <select {...register('category')} className="w-full px-3 py-2 rounded">
            {categories.map((c) => (
              <option key={c._id} value={c._id}>{c.name}</option>
            ))}
          </select>
          <select {...register('frequency')} className="w-full px-3 py-2 rounded">
            <option value="Daily">Daily</option>
            <option value="Weekly">Weekly</option>
            <option value="Monthly">Monthly</option>
            <option value="Yearly">Yearly</option>
          </select>
          <div className="flex gap-2">
            <input {...register('startDate')} type="date" className="w-1/2 px-3 py-2 rounded" />
            <input {...register('endDate')} type="date" className="w-1/2 px-3 py-2 rounded" />
          </div>
          <button className="rounded bg-cyan-500 px-4 py-2">Create</button>
        </form>

        <div className="bg-slate-900 p-4 rounded">
          <h3 className="font-semibold mb-2">Upcoming</h3>
          {loading ? <p>Loading...</p> : (
            <ul>
              {items.map((r) => (
                <li key={r._id} className="border-b py-2 flex justify-between items-center">
                  <div>
                    <div className="font-medium">{r.title} — {r.type} — {r.amount}</div>
                    <div className="text-sm text-slate-400">Next: {new Date(r.nextExecutionDate).toLocaleDateString()}</div>
                  </div>
                  <div className="flex gap-2">
                    {r.status === 'Active' ? (
                      <button onClick={() => handlePause(r._id)} className="px-2 py-1 bg-amber-500 rounded">Pause</button>
                    ) : (
                      <button onClick={() => handleResume(r._id)} className="px-2 py-1 bg-emerald-500 rounded">Resume</button>
                    )}
                    <button onClick={() => handleDelete(r._id)} className="px-2 py-1 bg-rose-500 rounded">Delete</button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default Recurring;
