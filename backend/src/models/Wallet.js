const mongoose = require('mongoose');

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

module.exports = mongoose.model('Wallet', walletSchema);