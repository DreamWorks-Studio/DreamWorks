import dotenv from "dotenv";
dotenv.config(); // Load .env variables at the top
import express from 'express'
import cors from 'cors'
import connectDB from './config/database.js';
import paymentRouter from './routes/payment.route.js';
import packageRouter from './routes/package.route.js';
import bookingRouter from './routes/booking.route.js';
import userRouter from "./routes/user.route.js";
import authRouter from "./routes/auth.route.js";
import cookieParser from "cookie-parser";
import portfolioRouter from "./routes/portfolio.route.js";

import contactRoutes from './routes/contact.route.js';

import cardRouter from "./routes/card.route.js";





const app = express();
const port = process.env.PORT || 5003;

// Connect to Database
connectDB();

// Middlewares
app.use(express.json());
app.use(cookieParser());

// CORS Configuration
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);

//Debug middlewares
app.use((req, res, next) => {
    console.log('Request body before route:', req.body);  // Debug line
    next();
});


// API Routes
app.use('/api/booking', bookingRouter);
app.use("/api/user", userRouter);
app.use("/api/auth", authRouter);
app.use('/api/portfolio', portfolioRouter);
app.use('/api/package',packageRouter)
app.use('/api/payments', paymentRouter);
app.use('/api/cards', cardRouter);
app.use('/api', contactRoutes);
//app.use('/backend/auth',authRoute)


// Error Handling Middleware
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  return res.status(statusCode).json({
    success: false,
    statusCode,
    message,
  });
});

// Start Server (Keep this last)
app.listen(port, () => {

    console.log(`Server is up and running on port : ${port}`);
})







