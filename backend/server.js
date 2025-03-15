import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import connectDB from './config/database.js';
import paymentRouter from './routes/payment.route.js';

dotenv.config();

//App config
const app = express();
const port = process.env.PORT || 5003
connectDB()

//middlewares
app.use(cors())
app.use(express.json())
app.use((req, res, next) => {
    console.log('Request body before route:', req.body);  // Debug line
    next();
});



//api endpoints
app.use('/api/payments', paymentRouter);

app.listen(port, () => {
    console.log(`Server is up and running on port : ${port}`);
})