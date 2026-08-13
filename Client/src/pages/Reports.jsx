import { useEffect, useMemo, useState } from 'react';
import { FiDownload, FiSearch } from 'react-icons/fi';
import { getReports } from '../services/report.service';
import { exportPdf, exportExcel, exportCsv, downloadBlob } from '../services/export.service';
import { getCategories } from '../services/category.service';
import toast from 'react-hot-toast';

const Reports = () => {
  const [reports, setReports] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [type, setType] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reportType, setReportType] = useState('all');
  const perPage = 8;

  const fetchData = async () => {
    setLoading(true);
    try {
      const [reportsRes, categoryRes] = await Promise.all([getReports({ page, limit: perPage }), getCategories()]);
      setReports(reportsRes.data.transactions || []);
      setCategories(categoryRes.data.categories || []);
    } catch {
      toast.error('Unable to load reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page]);

  const handleSearch = async () => {
    if (!search.trim()) {
      fetchData();
      return;
    }
    try {
      const { data } = await getReports({ keyword: search, reportType, category, type, startDate, endDate });
      setReports(data.transactions || []);
    } catch {
      toast.error('Unable to search reports');
    }
  };

  const handleFilter = async () => {
    try {
      if (!category && !type && !(startDate && endDate) && !search && reportType === 'all') {
        fetchData();
        return;
      }
      const params = {
        category,
        type,
        startDate,
        endDate,
        reportType,
      };
      const { data } = await getReports(params);
      setReports(data.transactions || []);
    } catch {
      toast.error('Unable to apply filter');
    }
  };

  const totalAmount = useMemo(() => reports.reduce((sum, item) => sum + Number(item.amount), 0), [reports]);

  const handleExport = async (format) => {
    setExporting(true);
    try {
      const params = {
        reportType,
        category,
        type,
        startDate,
        endDate,
        keyword: search,
        title: reportType === 'monthly' ? 'Monthly Expense Report' : 'Expense Report',
      };

      const response = format === 'pdf'
        ? await exportPdf(params)
        : format === 'excel'
          ? await exportExcel(params)
          : await exportCsv(params);

      const blob = new Blob([response.data], { type: response.headers['content-type'] });
      const contentDisposition = response.headers['content-disposition'] || response.headers['Content-Disposition'] || '';
      const filenameMatch = contentDisposition.match(/filename="?([^";]+)"?/);
      const filename = filenameMatch ? filenameMatch[1] : `expense-report.${format === 'excel' ? 'xlsx' : format}`;
      downloadBlob(blob, filename);
      toast.success('Export initialized successfully');
    } catch (error) {
      console.error(error);
      toast.error('Failed to export report');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-3xl border border-slate-800 bg-slate-900/70 p-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-cyan-400">Reports</p>
          <h1 className="mt-2 text-3xl font-semibold">Explore your financial activity</h1>
        </div>
        <div className="grid gap-2 sm:grid-cols-3">
          <button onClick={() => handleExport('pdf')} disabled={exporting} className="flex items-center justify-center gap-2 rounded-2xl bg-cyan-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:opacity-60">
            <FiDownload /> {exporting ? 'Exporting PDF...' : 'Export PDF'}
          </button>
          <button onClick={() => handleExport('excel')} disabled={exporting} className="flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:opacity-60">
            <FiDownload /> {exporting ? 'Exporting Excel...' : 'Export Excel'}
          </button>
          <button onClick={() => handleExport('csv')} disabled={exporting} className="flex items-center justify-center gap-2 rounded-2xl bg-slate-700 px-4 py-3 text-sm font-semibold text-slate-100 transition hover:bg-slate-600 disabled:opacity-60">
            <FiDownload /> {exporting ? 'Exporting CSV...' : 'Export CSV'}
          </button>
        </div>
      </div>

      <div className="grid gap-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-4 lg:grid-cols-[1.2fr_0.8fr_0.8fr_0.8fr]">
        <label className="flex items-center gap-2 rounded-2xl border border-slate-700 bg-slate-800/70 px-3 py-2">
          <FiSearch className="text-slate-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} className="w-full bg-transparent outline-none" placeholder="Search reports" />
        </label>
        <select value={reportType} onChange={(e) => setReportType(e.target.value)} className="rounded-2xl border border-slate-700 bg-slate-800/70 px-3 py-2 outline-none">
          <option value="all">All Transactions</option>
          <option value="income">Income Only</option>
          <option value="expense">Expense Only</option>
          <option value="category">Category-wise</option>
          <option value="monthly">Monthly</option>
          <option value="yearly">Yearly</option>
        </select>
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="rounded-2xl border border-slate-700 bg-slate-800/70 px-3 py-2 outline-none">
          <option value="">All categories</option>
          {categories.map((item) => <option key={item._id} value={item._id}>{item.name}</option>)}
        </select>
        <select value={type} onChange={(e) => setType(e.target.value)} className="rounded-2xl border border-slate-700 bg-slate-800/70 px-3 py-2 outline-none">
          <option value="">All types</option>
          <option value="Income">Income</option>
          <option value="Expense">Expense</option>
        </select>
      </div>
      <div className="grid gap-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-4 lg:grid-cols-[1.2fr_1fr]">
        <div className="flex gap-2">
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full rounded-2xl border border-slate-700 bg-slate-800/70 px-3 py-2 outline-none" />
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full rounded-2xl border border-slate-700 bg-slate-800/70 px-3 py-2 outline-none" />
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={handleSearch} className="rounded-2xl bg-cyan-500 px-4 py-2 font-semibold text-slate-950">Search</button>
          <button onClick={handleFilter} className="rounded-2xl border border-slate-700 px-4 py-2 text-slate-200">Apply Filters</button>
          <button onClick={() => { setSearch(''); setCategory(''); setType(''); setStartDate(''); setEndDate(''); setReportType('all'); fetchData(); }} className="rounded-2xl border border-slate-700 px-4 py-2 text-slate-200">Reset</button>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <button onClick={handleSearch} className="rounded-2xl bg-cyan-500 px-4 py-2 font-semibold text-slate-950">Search</button>
        <button onClick={handleFilter} className="rounded-2xl border border-slate-700 px-4 py-2 text-slate-200">Apply Filters</button>
        <button onClick={() => { setSearch(''); setCategory(''); setType(''); setStartDate(''); setEndDate(''); setReportType('all'); fetchData(); }} className="rounded-2xl border border-slate-700 px-4 py-2 text-slate-200">Reset</button>
      </div>
      <div className="grid gap-3 rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
        <p className="text-sm text-slate-400">Quick export</p>
        <div className="grid gap-2 sm:grid-cols-3">
          <button onClick={() => handleExport('pdf')} disabled={exporting} className="rounded-2xl bg-cyan-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:opacity-60">
            {exporting ? 'Exporting...' : 'Export PDF'}
          </button>
          <button onClick={() => handleExport('excel')} disabled={exporting} className="rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:opacity-60">
            {exporting ? 'Exporting...' : 'Export Excel'}
          </button>
          <button onClick={() => handleExport('csv')} disabled={exporting} className="rounded-2xl bg-slate-700 px-4 py-3 text-sm font-semibold text-slate-100 transition hover:bg-slate-600 disabled:opacity-60">
            {exporting ? 'Exporting...' : 'Export CSV'}
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
          <p className="text-sm text-slate-400">Matching Transactions</p>
          <p className="mt-2 text-2xl font-semibold">{reports.length}</p>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
          <p className="text-sm text-slate-400">Filtered Amount</p>
          <p className="mt-2 text-2xl font-semibold">${totalAmount.toFixed(2)}</p>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
          <p className="text-sm text-slate-400">Current Page</p>
          <p className="mt-2 text-2xl font-semibold">{page}</p>
        </div>
      </div>

      {loading ? <div className="h-48 animate-pulse rounded-2xl bg-slate-800/70" /> : <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60"> <table className="min-w-full text-left text-sm"> <thead className="bg-slate-800/70 text-slate-300"><tr><th className="px-4 py-3">Title</th><th className="px-4 py-3">Category</th><th className="px-4 py-3">Type</th><th className="px-4 py-3">Amount</th><th className="px-4 py-3">Date</th></tr></thead><tbody>{reports.map((item) => <tr key={item._id} className="border-t border-slate-800/80 text-slate-200"><td className="px-4 py-3">{item.title}</td><td className="px-4 py-3">{item.category?.name || '—'}</td><td className="px-4 py-3">{item.type}</td><td className="px-4 py-3">${Number(item.amount).toFixed(2)}</td><td className="px-4 py-3">{new Date(item.date).toLocaleDateString()}</td></tr>)}</tbody></table></div>}

      <div className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-900/60 px-4 py-3">
        <p className="text-sm text-slate-400">Page {page}</p>
        <div className="flex gap-2">
          <button disabled={page === 1} onClick={() => setPage((prev) => Math.max(1, prev - 1))} className="rounded-xl border border-slate-700 px-3 py-2 text-sm disabled:opacity-50">Prev</button>
          <button onClick={() => setPage((prev) => prev + 1)} className="rounded-xl border border-slate-700 px-3 py-2 text-sm">Next</button>
        </div>
      </div>
    </div>
  );
};

export default Reports;
