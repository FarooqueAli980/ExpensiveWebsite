import dotenv from "dotenv";
dotenv.config();

import app from "./src/app.js";
import connectDB from "./src/config/database.js";
import { ensureAdminAccount } from "./src/utils/seedAdmin.js";
import { startRecurringScheduler } from './src/utils/recurringScheduler.js';
import Budget from './src/models/Budget.js';

const PORT = process.env.PORT || 5000;
connectDB()
  .then(async () => {
    await ensureAdminAccount();
    // Ensure mongoose indexes match the schema (helps remove stale/mismatched indexes that cause E11000)
    try {
      await Budget.syncIndexes();
      console.log('Budget indexes synchronized.');
    } catch (idxErr) {
      console.warn('Failed to sync Budget indexes:', idxErr.message || idxErr);
    }
    // start recurring transaction scheduler
    startRecurringScheduler();

    app.listen(PORT, () => {
      console.log(`
=====================================
🚀 Server Running Successfully
🌍 http://localhost:${PORT}
=====================================
`);
    });
  })
  .catch((error) => {
    console.error('Failed to start server:', error);
  });