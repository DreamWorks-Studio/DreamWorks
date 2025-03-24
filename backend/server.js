import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import connectDB from './config/database.js';
import bookingRouter from './routes/booking.route.js';


dotenv.config();

const app = express();
const port = process.env.PORT || 5003
connectDB()


//middlewares
app.use(cors())
app.use(express.json())


//api endpoints

app.use('/api/booking', bookingRouter);

app.listen(port, () => {
    console.log(`Server is up and running on port : ${port}`);
})