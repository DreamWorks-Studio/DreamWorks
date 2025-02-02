import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import connectDB from './config/database.js';

dotenv.config();

//App config
const app = express();
const port = process.env.PORT || 5003
connectDB()

//middlewares
app.use(express.json())
app.use(cors())

//api endpoints
app.get('/',(req,res) => {
    res.send("API Working")
})

app.listen(port, () => {
    console.log(`Server is up and running on port : ${port}`);
})