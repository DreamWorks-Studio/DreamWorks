import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import connectDB from './config/database.js';
import userRouter from './routes/user.route.js'
import authRouter from './routes/auth.route.js'
import cookieParser from 'cookie-parser';
import User from './model/user.model.js';

dotenv.config();

//App config
const app = express();
const port = process.env.PORT || 5003
connectDB()

//middlewares
app.use(express.json())
app.use(cors())

//
app.use(cookieParser());
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

app.post('/forgot-password', (req,res) =>{

    const {email} = req.body
    User.findOne({email : email})
        .then(user => {

            if(!user){
                return res.send({status : "User is not Existed"})
            }

            const token = jwt.sign({id : user._id} , "jwt_secret_key" , {expiresIn : "1d"});

            var transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                  user: 'youremail@gmail.com',
                  pass: 'yourpassword'
                }
              });
              
              var mailOptions = {
                from: 'youremail@gmail.com',
                to: 'myfriend@yahoo.com',
                subject: 'Reset Your Password',
                text: `http://localhost:5173/reset-password/${user._id}/${token}`
              };
              
              transporter.sendMail(mailOptions, function(error, info){
                if (error) {
                  console.log(error);
                } else {
                  return res.send({Status : "Success"})
                }
              });
        })
        

})