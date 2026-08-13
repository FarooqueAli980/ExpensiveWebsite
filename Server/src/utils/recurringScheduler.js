import cron from 'node-cron';
import { generateDueTransactions } from '../controllers/recurring.controller.js';

// Run every hour to generate due recurring transactions
export const startRecurringScheduler = () => {
  // runs at minute 0 of every hour
  cron.schedule('0 * * * *', async () => {
    try {
      await generateDueTransactions();
    } catch (err) {
      console.error('Recurring scheduler error:', err.message);
    }
  });
};
