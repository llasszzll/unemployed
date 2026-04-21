const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  companyName: { type: String, required: true },
  position: { type: String, required: true },
  applicationDate: { type: Date, default: Date.now },
  status: { 
    type: String, 
    enum: ['pending', 'interview', 'rejected', 'no_response', 'accepted'],
    default: 'pending'
  },
  feedback: { type: String, default: '' },
  rejectionReason: { type: String, default: '' },
  notes: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

applicationSchema.index({ user: 1, companyName: 1 });

module.exports = mongoose.model('Application', applicationSchema);