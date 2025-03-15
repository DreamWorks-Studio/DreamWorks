import jwt from 'jsonwebtoken'
import { errorHandler } from './error';


export const verifyToken = (req,res,next) => {
    const token = req.cookie.access_token;

    if(!token) return next(errorHandler(401,'Access denied'))

    jwt.verify(token,process.env.JWT_SECRET ,(error, user) =>{

        if(error) return next(errorHandler(401,'Token is not valid'))
          req.uesr = user;
          next();


    })


}