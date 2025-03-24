import dotenv from "dotenv";
dotenv.config(); // Load .env variables at the top
import express from 'express'
import cors from 'cors'
import bookingRouter from './routes/booking.route.js';
import connectDB from "./config/database.js";
import userRouter from "./routes/user.route.js";
import authRouter from "./routes/auth.route.js";
import cookieParser from "cookie-parser";
import portfolioRouter from "./routes/portfolio.route.js";

const app = express();
const port = process.env.PORT || 5003;

// Connect to Database
connectDB();

// Middlewares
app.use(express.json());
app.use(cookieParser());

//middlewares
app.use(cors())
app.use(express.json())


// API Routes
app.use('/api/booking', bookingRouter);
app.use("/api/user", userRouter);
app.use("/api/auth", authRouter);
app.use('/api/portfolio', portfolioRouter);





// CORS Configuration
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);

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
  console.log(` Server is running on port: ${port}`);
});


