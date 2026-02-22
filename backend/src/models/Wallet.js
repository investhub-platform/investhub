import mongoose from 'mongoose';

const walletSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', 
      required: true,
      unique: true 
    },
    balance: {
      type: Number,
      default: 0,
    },
    currency: {
      type: String,
      default: 'LKR',
    },
    status: {
      type: String,
      enum: ['Active', 'Frozen'],
      default: 'Active'
    }
  },
  { timestamps: true }
);
export default mongoose.model('Wallet', walletSchema);