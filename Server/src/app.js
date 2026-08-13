import express from 'express';
import cors from 'cors';
import  helmet from 'helmet';
import morgan from 'morgan';
import { config } from 'dotenv';
import compression from 'compression';
import cookieParser  from 'cookie-parser';
import authRoutes from "./routes/auth.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import categoryRoutes from "./routes/category.routes.js";
import transactionRoutes from "./routes/transaction.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import budgetRoutes from "./routes/budget.routes.js";
import reportRoutes from "./routes/report.routes.js";
import recurringRoutes from "./routes/recurring.routes.js";
import path from 'path';
import projectRoutes from "./routes/project.routes.js";

const app = express();

app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(compression());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(path.resolve('uploads')));

app.use("/api/dashboard", dashboardRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/budgets", budgetRoutes);
app.use("/api/reports", reportRoutes);
app.use('/api/recurring', recurringRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/projects", projectRoutes);

app.get("/", (req, res) => {

  res.status(200).json({
    success: true,
    message: "Expense Tracker API is Running 🚀"
  });
});

export default app;