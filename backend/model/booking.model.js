import mongoose from "mongoose"

const bookingSchema = new mongoose.Schema({
     
    userId: {
        type : mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required : true
    },

    packageId: {
        type : mongoose.Schema.Types.ObjectId,
        ref: 'Package',
        required :true
    },

    telephone : {
         type : Number,
         required :  true,
        
    },
    service : {
        type : String,
        required : true,
    },

    date :   {
        type : Date,
        required : true,
    },

    location : {
        type : String,
        required : true,
    },

    addson :{
        type : String,
    }


},
);

const Booking = mongoose.model('Booking',bookingSchema);
export default Booking;