import mongoose from 'mongoose';

const transactionSchema = mongoose.Schema(
  {
    walletId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Wallet',
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    type: {
      type: String,
      enum: ['Deposit', 'Withdrawal', 'Investment', 'Refund', 'PlatformFee'],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: 'LKR'
    },
    paymentId: { type: String },
    status: {
      type: String,
      enum: ['Pending', 'Completed', 'Failed'],
      default: 'Pending',
    },
    completedAt: { type: Date },
    description: { type: String },
    relatedStartupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Startup'
    }
  },
  { timestamps: true }
);

export default mongoose.model('Transaction', transactionSchema);