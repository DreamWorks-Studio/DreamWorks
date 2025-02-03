import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import connectDB from './config/database.js';
import userRouter from './routes/user.route.js'

dotenv.config();

//App config
const app = express();
const port = process.env.PORT || 5003
connectDB()

//middlewares
app.use(express.json())
app.use(cors())

//api endpoints

app.listen(port, () => {
    console.log(`Server is up and running on port : ${port}`);
});

app.use("/api/user", userRouter);