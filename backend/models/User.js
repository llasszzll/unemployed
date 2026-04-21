const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const generateProfileId = () => {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  profileId: { type: String, unique: true },
  fullName: { type: String, default: '' },
  phone: { type: String, default: '' },
  resume: {
    filename: String,
    originalName: String,
    path: String,
    uploadedAt: Date
  },
  createdAt: { type: Date, default: Date.now }
});

userSchema.pre('save', async function(next) {
  if (!this.profileId) {
    const exists = await mongoose.model('User').findOne({ profileId: this.profileId });
    if (!exists) {
      let newProfileId;
      let idExists = true;
      while (idExists) {
        newProfileId = generateProfileId();
        idExists = await mongoose.model('User').findOne({ profileId: newProfileId });
      }
      this.profileId = newProfileId;
    }
  }
  next();
});

userSchema.methods.comparePassword = async function(password) {
  return bcrypt.compare(password, this.password);
};

userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);