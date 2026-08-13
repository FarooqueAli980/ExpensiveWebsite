import { useEffect, useState } from 'react';
import { FiPlus } from 'react-icons/fi';
import CategoryForm from '../components/CategoryForm';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../services/category.service';
import toast from 'react-hot-toast';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data } = await getCategories();
      setCategories(data.categories || []);
    } catch {
      toast.error('Unable to load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreate = async (data) => {
    try {
      await createCategory(data);
      toast.success('Category created');
      setModalOpen(false);
      fetchData();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Unable to create category');
    }
  };

  const handleUpdate = async (data) => {
    try {
      await updateCategory(editingItem._id, data);
      toast.success('Category updated');
      setEditingItem(null);
      setModalOpen(false);
      fetchData();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Unable to update category');
    }
  };

  const handleDelete = async () => {
    try {
      await deleteCategory(deleteId);
      toast.success('Category deleted');
      setDeleteId(null);
      fetchData();
      try { window.dispatchEvent(new CustomEvent('app:dataChanged', { detail: { type: 'category', id: deleteId } })); } catch (e) { }
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Unable to delete category');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-3xl border border-slate-800 bg-slate-900/70 p-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-cyan-400">Categories</p>
          <h1 className="mt-2 text-3xl font-semibold">Organize income and expenses</h1>
        </div>
        <button onClick={() => { setEditingItem(null); setModalOpen(true); }} className="flex items-center justify-center gap-2 rounded-2xl bg-cyan-500 px-4 py-3 font-semibold text-slate-950">
          <FiPlus /> Add Category
        </button>
      </div>

      {loading ? <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-32 animate-pulse rounded-2xl bg-slate-800/70" />)}</div> : <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{categories.map((category) => (
        <div key={category._id} className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl text-2xl" style={{ backgroundColor: `${category.color}20`, color: category.color }}>
                {category.icon || '•'}
              </span>
              <div>
                <h3 className="font-semibold">{category.name}</h3>
                <p className="text-sm text-slate-400">{category.type}</p>
              </div>
            </div>
            <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-300">{category.type}</span>
          </div>
          <div className="mt-5 flex gap-2">
            <button onClick={() => { setEditingItem(category); setModalOpen(true); }} className="rounded-xl bg-slate-800 px-3 py-2 text-sm">Edit</button>
            <button onClick={() => setDeleteId(category._id)} className="rounded-xl bg-rose-500/20 px-3 py-2 text-sm text-rose-300">Delete</button>
          </div>
        </div>
      ))}</div>}

      {modalOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/70 p-4">
          <div className="w-full max-w-xl rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold">{editingItem ? 'Edit Category' : 'Create Category'}</h2>
              <button onClick={() => { setModalOpen(false); setEditingItem(null); }} className="text-slate-400">Close</button>
            </div>
            <CategoryForm initialValues={editingItem || null} loading={loading} onSubmit={editingItem ? handleUpdate : handleCreate} />
          </div>
        </div>
      )}

      {deleteId && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/70 p-4">
          <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-xl font-semibold">Delete category?</h2>
            <p className="mt-2 text-slate-400">Deleting it will remove it from transactions.</p>
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

export default Categories;
