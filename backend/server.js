require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

if (!fs.existsSync('./uploads')) {
  fs.mkdirSync('./uploads');
}

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const applicationRoutes = require('./routes/applications');
const User = require('./models/User');
const Application = require('./models/Application');
const generateProfileId = () => Math.random().toString(36).substring(2, 10);

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/applications', applicationRoutes);

app.get('/api/public/:profileId', async (req, res) => {
  try {
    let user = await User.findOne({ profileId: req.params.profileId }).select('-password -email');
    if (!user) {
      const usersWithoutId = await User.find({ profileId: { $exists: false } });
      if (usersWithoutId.length > 0) {
        for (const u of usersWithoutId) {
          let newProfileId;
          let exists = true;
          while (exists) {
            newProfileId = generateProfileId();
            exists = await User.findOne({ profileId: newProfileId });
          }
          await User.findByIdAndUpdate(u._id, { profileId: newProfileId });
        }
        user = await User.findOne({ profileId: req.params.profileId }).select('-password -email');
      }
    }
    if (!user) return res.status(404).json({ message: 'Profile not found' });
    const applications = await Application.find({ user: user._id });
    res.json({ user, applications });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get('/api/public/:profileId/resume', async (req, res) => {
  try {
    const user = await User.findOne({ profileId: req.params.profileId });
    if (!user || !user.resume || !user.resume.path) {
      return res.status(404).json({ message: 'Resume not found' });
    }
    res.download(user.resume.path, user.resume.originalName);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get('/api/debug/users', async (req, res) => {
  const users = await User.find().select('username profileId');
  res.json({ count: users.length, users });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
