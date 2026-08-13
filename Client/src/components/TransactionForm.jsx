import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

const TransactionForm = ({ onSubmit, initialValues, categories, loading, projects }) => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: initialValues || {
      title: '',
      amount: '',
      type: 'Expense',
      category: '',
      paymentMethod: 'Cash',
      date: new Date().toISOString().slice(0, 10),
      note: '',
      project: '',
    },
  });

  useEffect(() => {
    reset(initialValues || {
      title: '',
      amount: '',
      type: 'Expense',
      category: '',
      paymentMethod: 'Cash',
      date: new Date().toISOString().slice(0, 10),
      note: '',
    });
  }, [initialValues, reset]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm text-slate-300">Title</label>
          <input {...register('title', { required: 'Title is required' })} className="w-full rounded-2xl border border-slate-700 bg-slate-800 px-3 py-3 outline-none" />
          {errors.title && <p className="mt-1 text-sm text-rose-400">{errors.title.message}</p>}
        </div>
        <div>
          <label className="mb-2 block text-sm text-slate-300">Amount</label>
          <input type="number" step="0.01" {...register('amount', { required: 'Amount is required', min: 1 })} className="w-full rounded-2xl border border-slate-700 bg-slate-800 px-3 py-3 outline-none" />
          {errors.amount && <p className="mt-1 text-sm text-rose-400">{errors.amount.message}</p>}
        </div>
        <div>
          <label className="mb-2 block text-sm text-slate-300">Type</label>
          <select {...register('type')} className="w-full rounded-2xl border border-slate-700 bg-slate-800 px-3 py-3 outline-none">
            <option value="Expense">Expense</option>
            <option value="Income">Income</option>
          </select>
        </div>
        <div>
          <label className="mb-2 block text-sm text-slate-300">Category</label>
          <select {...register('category', { required: 'Category is required' })} className="w-full rounded-2xl border border-slate-700 bg-slate-800 px-3 py-3 outline-none">
            <option value="">Select category</option>
            {categories.map((category) => (
              <option key={category._id} value={category._id}>{category.name}</option>
            ))}
          </select>
          {errors.category && <p className="mt-1 text-sm text-rose-400">{errors.category.message}</p>}
        </div>
        <div>
          <label className="mb-2 block text-sm text-slate-300">Payment Method</label>
          <select {...register('paymentMethod')} className="w-full rounded-2xl border border-slate-700 bg-slate-800 px-3 py-3 outline-none">
            <option value="Cash">Cash</option>
            <option value="Bank">Bank</option>
            <option value="Card">Card</option>
            <option value="JazzCash">JazzCash</option>
            <option value="EasyPaisa">EasyPaisa</option>
          </select>
        </div>
        <div>
          <label className="mb-2 block text-sm text-slate-300">Date</label>
          <input type="date" {...register('date')} className="w-full rounded-2xl border border-slate-700 bg-slate-800 px-3 py-3 outline-none" />
        </div>
        <div>
          <label className="mb-2 block text-sm text-slate-300">Project</label>
          <select {...register('project')} className="w-full rounded-2xl border border-slate-700 bg-slate-800 px-3 py-3 outline-none">
            <option value="">(No project)</option>
            {projects?.map((p) => <option key={p._id} value={p._id}>{p.name}</option>)}
          </select>
        </div>
      </div>
      <div>
        <label className="mb-2 block text-sm text-slate-300">Note</label>
        <textarea {...register('note')} rows="3" className="w-full rounded-2xl border border-slate-700 bg-slate-800 px-3 py-3 outline-none" />
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <label className="mb-2 block text-sm text-slate-300">Item / Name</label>
          <input {...register('item')} className="w-full rounded-2xl border border-slate-700 bg-slate-800 px-3 py-3 outline-none" />
        </div>
        <div>
          <label className="mb-2 block text-sm text-slate-300">Quantity</label>
          <input type="number" step="1" {...register('quantity')} className="w-full rounded-2xl border border-slate-700 bg-slate-800 px-3 py-3 outline-none" />
        </div>
        <div>
          <label className="mb-2 block text-sm text-slate-300">Unit Price</label>
          <input type="number" step="0.01" {...register('unitPrice')} className="w-full rounded-2xl border border-slate-700 bg-slate-800 px-3 py-3 outline-none" />
        </div>
      </div>
      <div>
        <label className="mb-2 block text-sm text-slate-300">Invoice / Reference</label>
        <input {...register('invoice')} className="w-full rounded-2xl border border-slate-700 bg-slate-800 px-3 py-3 outline-none" />
      </div>
      <div className="flex justify-end">
        <button disabled={loading} className="rounded-2xl bg-cyan-500 px-4 py-3 font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:opacity-70">
          {loading ? 'Saving...' : 'Save Transaction'}
        </button>
      </div>
    </form>
  );
};

export default TransactionForm;
