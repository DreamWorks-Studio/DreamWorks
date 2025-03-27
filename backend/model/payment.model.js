import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    packageId: { type: mongoose.Schema.Types.ObjectId, ref: 'Package', required: true },
    amountPaid: { type: Number, required: true },
    packagePrice: { type: Number, required: true },
    paymentMethod: { type: String, enum: ['cash', 'card'], required: true },
    paymentStatus: { type: String, enum: ['pending', 'paid', 'partial'], default: 'pending' },
    totalAmount: { type: Number, required: true },
    paymentType: { type: String, enum: ['full', 'partial'], required: function() { return this.paymentMethod === 'card'; } },
    remainingAmount: { type: Number, default: 0 },
    cardNumber: {
        type: String,
        required: function() { return this.paymentMethod === 'card' && this.paymentType === 'partial'; }, // Only required for partial payments
        set: function(cardNum) {
            if (!cardNum) return null;
            const digits = cardNum.replace(/\s/g, '');
            return '*'.repeat(digits.length - 4) + digits.slice(-4);
        }
    },
    /*last4Digits: {  
        type: String,
        required: function() { return this.paymentMethod === 'card' && this.paymentType === 'partial'; }
    },*/
    expiryDate: {
        type: String,
        required: function() { return this.paymentMethod === 'card' && this.paymentType === 'partial'; }
    },

    isCardSaved: { type: Boolean, default: false }
}, { timestamps: true });

paymentSchema.pre('save', function(next){
    if (this.paymentType === 'partial') {
        this.remainingAmount = this.totalAmount - this.amountPaid;
    } else {
        this.remainingAmount = 0;
    }
    next();
});

const Payment = mongoose.model('Payment', paymentSchema);
export default Payment;
