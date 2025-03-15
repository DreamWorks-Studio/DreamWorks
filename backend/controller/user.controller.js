import User from "../model/user.model.js";
import { errorHandler } from "../utils/error.js";
import bcryptjs from 'bcryptjs'

export const test = (req,res) => {
    res.json({

        message : 'API  route is Working !!',
    });
};

//update the User

export const UpdateUser = async (req, res, next) => {
    if (req.user.id !== req.params.id)
      return next(errorHandler(401, 'You can only update your own account!'));
    try {
      if (req.body.password) {
        req.body.password = bcryptjs.hashSync(req.body.password, 10);
      }
  
      const UpdatedUser = await User.findByIdAndUpdate(
        req.params.id,
        {
          $set: {
            username: req.body.username,
            email: req.body.email,
            password: req.body.password,
            avatar: req.body.avatar,
          },
        },
        { new: true }
      );
  
      const { password, ...rest } = UpdatedUser._doc;
  
      res.status(200).json(rest);
    } catch (error) {
      next(error);
    }
  };

  export const DeleteUser = async(req,res,next) => {

    if(req.user.id != req.param.id){
        return next(errorHandler(401 , "You can delete Only Your Account"));
    }try {
        await User.findByIdAndDelete(req.param.id);
        res.status(200).json("User deleted Succesfully!!")
        
    } catch (error) {
        next(error)
    }

  }