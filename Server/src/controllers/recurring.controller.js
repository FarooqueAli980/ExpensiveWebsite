import RecurringTransaction from '../models/RecurringTransaction.js';
import Transaction from '../models/Transaction.js';

const computeNext = (date, frequency) => {
  const d = new Date(date);
  switch (frequency) {
    case 'Daily':
      d.setDate(d.getDate() + 1);
      break;
    case 'Weekly':
      d.setDate(d.getDate() + 7);
      break;
    case 'Monthly':
      d.setMonth(d.getMonth() + 1);
      break;
    case 'Yearly':
      d.setFullYear(d.getFullYear() + 1);
      break;
    default:
      d.setMonth(d.getMonth() + 1);
  }
  return d;
};

export const createRecurring = async (req, res) => {
  try {
    const { title, amount, type, category, frequency, startDate, endDate } = req.body;
    if (!title || !amount || !type || !category || !frequency || !startDate) {
      return res.status(400).json({ success: false, message: 'Missing required fields.' });
    }

    const nextExecutionDate = new Date(startDate);

    const recurring = await RecurringTransaction.create({
      title,
      amount,
      type,
      category,
      frequency,
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : undefined,
      nextExecutionDate,
      user: req.user._id,
    });

    res.status(201).json({ success: true, recurring });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getRecurrings = async (req, res) => {
  try {
    const recurrings = await RecurringTransaction.find({ user: req.user._id }).populate('category', 'name').sort({ nextExecutionDate: 1 });
    res.status(200).json({ success: true, recurrings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getRecurringById = async (req, res) => {
  try {
    const recurring = await RecurringTransaction.findOne({ _id: req.params.id, user: req.user._id }).populate('category', 'name');
    if (!recurring) return res.status(404).json({ success: false, message: 'Not found' });
    res.status(200).json({ success: true, recurring });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateRecurring = async (req, res) => {
  try {
    const recurring = await RecurringTransaction.findOne({ _id: req.params.id, user: req.user._id });
    if (!recurring) return res.status(404).json({ success: false, message: 'Not found' });

    Object.assign(recurring, req.body);
    await recurring.save();
    res.status(200).json({ success: true, recurring });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteRecurring = async (req, res) => {
  try {
    const recurring = await RecurringTransaction.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!recurring) return res.status(404).json({ success: false, message: 'Not found' });
    res.status(200).json({ success: true, message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const pauseRecurring = async (req, res) => {
  try {
    const recurring = await RecurringTransaction.findOne({ _id: req.params.id, user: req.user._id });
    if (!recurring) return res.status(404).json({ success: false, message: 'Not found' });
    recurring.status = 'Paused';
    await recurring.save();
    res.status(200).json({ success: true, recurring });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const resumeRecurring = async (req, res) => {
  try {
    const recurring = await RecurringTransaction.findOne({ _id: req.params.id, user: req.user._id });
    if (!recurring) return res.status(404).json({ success: false, message: 'Not found' });
    recurring.status = 'Active';
    // If nextExecutionDate is in the past, set it to now
    if (!recurring.nextExecutionDate || new Date(recurring.nextExecutionDate) < new Date()) recurring.nextExecutionDate = new Date();
    await recurring.save();
    res.status(200).json({ success: true, recurring });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Internal: used by scheduler to generate transactions
export const generateDueTransactions = async () => {
  const now = new Date();
  const due = await RecurringTransaction.find({ status: 'Active', nextExecutionDate: { $lte: now } });
  for (const r of due) {
    try {
      // generate for each missed occurrence until nextExecutionDate > now or endDate
      let execDate = new Date(r.nextExecutionDate);
      while (execDate <= now && (!r.endDate || execDate <= new Date(r.endDate))) {
        // check duplicate
        const startOfDay = new Date(execDate);
        startOfDay.setHours(0,0,0,0);
        const endOfDay = new Date(execDate);
        endOfDay.setHours(23,59,59,999);

        const exists = await Transaction.findOne({ recurringId: r._id, date: { $gte: startOfDay, $lte: endOfDay } });
        if (!exists) {
          await Transaction.create({
            title: r.title,
            amount: r.amount,
            type: r.type,
            category: r.category,
            date: execDate,
            user: r.user,
            note: `Recurring: ${r._id}`,
            recurringId: r._id,
          });
        }

        // compute next
        execDate = computeNext(execDate, r.frequency);
      }

      // set nextExecutionDate to the next occurrence after now
      let next = new Date(r.nextExecutionDate);
      while (next <= now) next = computeNext(next, r.frequency);

      // if endDate reached, pause
      if (r.endDate && next > new Date(r.endDate)) {
        r.status = 'Paused';
      } else {
        r.nextExecutionDate = next;
      }
      await r.save();
    } catch (err) {
      console.error('Recurring generation error for', r._id, err.message);
    }
  }
};
