export const calculateBalance = (income, expense) => {
  return income - expense;
};

export const formatCurrency = (amount) => {
  return Number(amount).toFixed(2);
};