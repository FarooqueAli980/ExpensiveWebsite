import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { FiPlus, FiSearch } from 'react-icons/fi';
import TransactionTable from '../components/TransactionTable';
import TransactionForm from '../components/TransactionForm';
import { getTransactions, createTransaction, updateTransaction, deleteTransaction } from '../services/transaction.service';
import { getCategories } from '../services/category.service';
import toast from 'react-hot-toast';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterType, setFilterType] = useState('');
  const [sortOrder, setSortOrder] = useState('desc');
  const [page, setPage] = useState(1);
  const perPage = 8;

  const fetchData = async () => {
    setLoading(true);
    try {
      const [txRes, catRes, projRes] = await Promise.all([getTransactions(), getCategories(), import('../services/project.service').then(m => m.getProjects())]);
      setTransactions(txRes.data.transactions || []);
      setCategories(catRes.data.categories || []);
      setProjects(projRes.data.projects || []);
    } catch (error) {
      toast.error('Unable to load transactions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredTransactions = useMemo(() => {
    const term = search.toLowerCase();
    return [...transactions]
      .filter((item) => (!term || item.title.toLowerCase().includes(term) || item.note.toLowerCase().includes(term)))
      .filter((item) => (!filterCategory || item.category?._id === filterCategory || item.category === filterCategory))
      .filter((item) => (!filterType || item.type === filterType))
      .sort((a, b) => sortOrder === 'asc' ? new Date(a.date) - new Date(b.date) : new Date(b.date) - new Date(a.date));
  }, [transactions, search, filterCategory, filterType, sortOrder]);

  const paginated = filteredTransactions.slice((page - 1) * perPage, page * perPage);
  const totalPages = Math.max(1, Math.ceil(filteredTransactions.length / perPage));

  const handleCreate = async (data) => {
    try {
      await createTransaction({ ...data, amount: Number(data.amount), quantity: Number(data.quantity || 0), unitPrice: Number(data.unitPrice || 0) });
      toast.success('Transaction created');
      setModalOpen(false);
      fetchData();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Unable to create transaction');
    }
  };

  const handleUpdate = async (data) => {
    try {
      await updateTransaction(editingItem._id, { ...data, amount: Number(data.amount), quantity: Number(data.quantity || 0), unitPrice: Number(data.unitPrice || 0) });
      toast.success('Transaction updated');
      setEditingItem(null);
      setModalOpen(false);
      fetchData();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Unable to update transaction');
    }
  };

  const handleDelete = async () => {
    try {
      await deleteTransaction(deleteId);
      toast.success('Transaction deleted');
      setDeleteId(null);
      fetchData();
      // Notify dashboard and other listeners to refresh aggregated data
      try { window.dispatchEvent(new CustomEvent('app:dataChanged', { detail: { type: 'transaction', id: deleteId } })); } catch (e) { /* ignore */ }
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Unable to delete transaction');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-3xl border border-slate-800 bg-slate-900/70 p-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-cyan-400">Transactions</p>
          <h1 className="mt-2 text-3xl font-semibold">Manage your cash flow</h1>
        </div>
        <button onClick={() => { setEditingItem(null); setModalOpen(true); }} className="flex items-center justify-center gap-2 rounded-2xl bg-cyan-500 px-4 py-3 font-semibold text-slate-950">
          <FiPlus /> Add Transaction
        </button>
      </div>

      <div className="grid gap-4 rounded-2xl border border-slate-800 bg-slate-900/50 p-4 md:grid-cols-2 xl:grid-cols-4">
        <label className="flex items-center gap-2 rounded-2xl border border-slate-700 bg-slate-800/70 px-3 py-2">
          <FiSearch className="text-slate-400" />
          <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="w-full bg-transparent outline-none" placeholder="Search transactions" />
        </label>
        <select value={filterCategory} onChange={(e) => { setFilterCategory(e.target.value); setPage(1); }} className="rounded-2xl border border-slate-700 bg-slate-800/70 px-3 py-2 outline-none">
          <option value="">All categories</option>
          {categories.map((category) => <option key={category._id} value={category._id}>{category.name}</option>)}
        </select>
        <select value={filterType} onChange={(e) => { setFilterType(e.target.value); setPage(1); }} className="rounded-2xl border border-slate-700 bg-slate-800/70 px-3 py-2 outline-none">
          <option value="">All types</option>
          <option value="Income">Income</option>
          <option value="Expense">Expense</option>
        </select>
        <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} className="rounded-2xl border border-slate-700 bg-slate-800/70 px-3 py-2 outline-none">
          <option value="desc">Newest first</option>
          <option value="asc">Oldest first</option>
        </select>
      </div>

      {loading ? <div className="h-48 animate-pulse rounded-2xl bg-slate-800/70" /> : <TransactionTable transactions={paginated} onEdit={(item) => { setEditingItem(item); setModalOpen(true); }} onDelete={(item) => setDeleteId(item._id)} />}

      <div className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-900/60 px-4 py-3">
        <p className="text-sm text-slate-400">Page {page} of {totalPages}</p>
        <div className="flex gap-2">
          <button disabled={page === 1} onClick={() => setPage((prev) => prev - 1)} className="rounded-xl border border-slate-700 px-3 py-2 text-sm disabled:opacity-50">Prev</button>
          <button disabled={page === totalPages} onClick={() => setPage((prev) => prev + 1)} className="rounded-xl border border-slate-700 px-3 py-2 text-sm disabled:opacity-50">Next</button>
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-40 flex items-start sm:items-center justify-center bg-slate-950/70 p-4">
          <div className="w-full max-w-2xl rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl max-h-[90vh] overflow-auto">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold">{editingItem ? 'Edit Transaction' : 'Create Transaction'}</h2>
              <button onClick={() => { setModalOpen(false); setEditingItem(null); }} className="text-slate-400">Close</button>
            </div>
            <TransactionForm
              initialValues={editingItem ? { ...editingItem, category: editingItem.category?._id || editingItem.category, date: new Date(editingItem.date).toISOString().slice(0, 10) } : null}
              categories={categories}
              projects={projects}
              loading={loading}
              onSubmit={editingItem ? handleUpdate : handleCreate}
            />
          </div>
        </div>
      )}

      {deleteId && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/70 p-4">
          <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-xl font-semibold">Delete transaction?</h2>
            <p className="mt-2 text-slate-400">This action cannot be undone.</p>
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

export default Transactions;
