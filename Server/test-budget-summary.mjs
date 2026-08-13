import fetch from 'node:fetch';
const url = 'http://localhost:5000';
const rand = Date.now();
const email = `user${rand}@example.com`;
const password = 'Password1!';

const fetchJson = async (path, options = {}) => {
  const res = await fetch(url + path, options);
  const text = await res.text();
  try {
    return { status: res.status, ok: res.ok, data: JSON.parse(text), raw: text };
  } catch {
    return { status: res.status, ok: res.ok, data: null, raw: text };
  }
};

const main = async () => {
  let result;
  result = await fetchJson('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'UserA', email, password }),
  });
  console.log('register', result.status, result.data || result.raw);
  if (!result.ok) return;

  result = await fetchJson('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  console.log('login', result.status, result.data || result.raw);
  if (!result.ok) return;
  const token = result.data.token;
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };

  result = await fetchJson('/api/categories', {
    method: 'POST',
    headers,
    body: JSON.stringify({ name: 'General', type: 'Expense', icon: 'icon', color: '#000' }),
  });
  console.log('category', result.status, result.data || result.raw);
  if (!result.ok) return;
  const categoryId = result.data.category._id;

  result = await fetchJson('/api/projects', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      name: 'Test Project',
      description: 'desc',
      category: 'General',
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 86400000).toISOString(),
      budget: 100000,
      status: 'Active',
    }),
  });
  console.log('project', result.status, result.data || result.raw);
  if (!result.ok) return;
  const projectId = result.data.project._id;

  result = await fetchJson('/api/budgets', {
    method: 'POST',
    headers,
    body: JSON.stringify({ month: new Date().getMonth() + 1, year: new Date().getFullYear(), amount: 100000, project: projectId }),
  });
  console.log('budget', result.status, result.data || result.raw);
  if (!result.ok) return;

  result = await fetchJson('/api/transactions', {
    method: 'POST',
    headers,
    body: JSON.stringify({ title: 'Expense1', amount: 20000, type: 'Expense', category: categoryId, paymentMethod: 'Cash', date: new Date().toISOString(), note: 'test', project: projectId }),
  });
  console.log('transaction', result.status, result.data || result.raw);
  if (!result.ok) return;

  result = await fetchJson(`/api/budgets/summary/${new Date().getMonth() + 1}/${new Date().getFullYear()}?project=${projectId}`, {
    method: 'GET',
    headers,
  });
  console.log('summary', result.status, result.data || result.raw);
};

main().catch((err) => {
  console.error(err);
});