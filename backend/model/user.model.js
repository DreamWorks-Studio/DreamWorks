import mongoose from "mongoose";

const UserScheme = new mongoose({

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
    required : true,
    unique: true,
}
}, {timeStamps : true}
);

const User = mongoose.model('User' ,UserScheme);

export default User;