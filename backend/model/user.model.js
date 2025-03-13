import mongoose from "mongoose";

const userSchema = new mongoose.Schema({

    username : {
         type : String,
         required : true,
         unique: true,
    },
    email : {
        type : String,
        required : true,
        unique: true,
   },
   password : {
    type : String,
    
    
},

   

   confirmpassword : {

    type : String,
   
 

   },

   avatar : {
      
        type : String,
        default : "https://img.freepik.com/free-vector/blue-circle-with-white-user_78370-4707.jpg?ga=GA1.1.427464810.1740819710&semt=ais_hybrid"
   },

}, {timeStamps : true}
);

const User = mongoose.model('User' , userSchema);

export default User;