import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import connectDB from './config/database.js';
import userRouter from './routes/user.route.js'
import authRouter from './routes/auth.route.js'
import cookieParser from 'cookie-parser';

dotenv.config();

//App config
const app = express();
const port = process.env.PORT || 5003
connectDB()

//middlewares
app.use(express.json())
app.use(cors())


//app.use(cookieParser());
//api endpoints

//Allow Access for API testing
app.use(express.json());

app.listen(port, () => {
    console.log(`Server is up and running on port : ${port}`);
});

app.use("/api/user", userRouter);
app.use("/api/auth" , authRouter);

//setting up the middleware 

app.use((err, req , res ,next)=> {

    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
    return res.status(statusCode).json({
        success: false,
        statusCode,
        message,
    });
});