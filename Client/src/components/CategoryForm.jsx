import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

const CategoryForm = ({ onSubmit, initialValues, loading }) => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: initialValues || { name: '', type: 'Expense', icon: '💸', color: '#38bdf8' },
  });

  useEffect(() => {
    reset(initialValues || { name: '', type: 'Expense', icon: '💸', color: '#38bdf8' });
  }, [initialValues, reset]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="mb-2 block text-sm text-slate-300">Name</label>
        <input {...register('name', { required: 'Name is required' })} className="w-full rounded-2xl border border-slate-700 bg-slate-800 px-3 py-3 outline-none" />
        {errors.name && <p className="mt-1 text-sm text-rose-400">{errors.name.message}</p>}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm text-slate-300">Type</label>
          <select {...register('type')} className="w-full rounded-2xl border border-slate-700 bg-slate-800 px-3 py-3 outline-none">
            <option value="Expense">Expense</option>
            <option value="Income">Income</option>
          </select>
        </div>
        <div>
          <label className="mb-2 block text-sm text-slate-300">Color</label>
          <input type="color" {...register('color')} className="h-12 w-full rounded-2xl border border-slate-700 bg-slate-800 p-1" />
        </div>
      </div>
      <div>
        <label className="mb-2 block text-sm text-slate-300">Emoji / Icon</label>
        <input {...register('icon')} className="w-full rounded-2xl border border-slate-700 bg-slate-800 px-3 py-3 outline-none" placeholder="🍽️" />
      </div>
      <div className="flex justify-end">
        <button disabled={loading} className="rounded-2xl bg-cyan-500 px-4 py-3 font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:opacity-70">
          {loading ? 'Saving...' : 'Save Category'}
        </button>
      </div>
    </form>
  );
};

export default CategoryForm;
