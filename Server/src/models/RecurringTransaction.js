import mongoose from 'mongoose';

const recurringTransactionSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    amount: { type: Number, required: true },
    type: { type: String, enum: ['Income', 'Expense'], required: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    frequency: { type: String, enum: ['Daily', 'Weekly', 'Monthly', 'Yearly'], required: true },
    nextExecutionDate: { type: Date, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date },
    status: { type: String, enum: ['Active', 'Paused'], default: 'Active' },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('RecurringTransaction', recurringTransactionSchema);
