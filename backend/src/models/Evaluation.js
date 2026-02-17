const mongoose = require('mongoose');

const evaluationSchema = mongoose.Schema(
  {
    startupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Startup',
      required: true,
      unique: true // One evaluation per startup
    },
    riskScore: {
      type: Number,
      min: 1,
      max: 10,
      required: true
    },
    swotAnalysis: {
      strengths: { type: String, required: true },
      weaknesses: { type: String, required: true },
      opportunities: { type: String, required: true },
      threats: { type: String, required: true }
    },
    generatedAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Evaluation', evaluationSchema);