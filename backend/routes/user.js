const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const User = require('../models/User');
const Application = require('../models/Application');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /pdf|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Only PDF, DOC, and DOCX files are allowed'));
  }
});

router.get('/profile', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    const applications = await Application.find({ user: req.userId });
    res.json({ user, applications });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/profile', authenticate, async (req, res) => {
  try {
    const { fullName, phone } = req.body;
    const user = await User.findByIdAndUpdate(
      req.userId,
      { fullName, phone },
      { new: true }
    );
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/profile/regenerate-id', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    let newProfileId = user.profileId;
    
    if (!newProfileId) {
      let exists = true;
      while (exists) {
        newProfileId = Math.random().toString(36).substring(2, 10);
        exists = await User.findOne({ profileId: newProfileId });
      }
    }
    
    const updatedUser = await User.findById(req.userId);
    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/profile/ensure-id', authenticate, async (req, res) => {
  try {
    let user = await User.findById(req.userId);
    if (!user.profileId) {
      let newProfileId;
      let exists = true;
      while (exists) {
        newProfileId = Math.random().toString(36).substring(2, 10);
        exists = await User.findOne({ profileId: newProfileId });
      }
      user = await User.findByIdAndUpdate(
        req.userId,
        { profileId: newProfileId },
        { new: true }
      );
    }
    res.json({ profileId: user.profileId });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/resume', authenticate, upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const user = await User.findById(req.userId);
    if (user.resume && user.resume.path) {
      try {
        fs.unlinkSync(user.resume.path);
      } catch (e) {}
    }

    user.resume = {
      filename: req.file.filename,
      originalName: req.file.originalname,
      path: req.file.path,
      uploadedAt: new Date()
    };
    await user.save();
    res.json({ resume: user.resume });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/resume', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user.resume || !user.resume.path) {
      return res.status(404).json({ message: 'No resume found' });
    }
    res.download(user.resume.path, user.resume.originalName);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/resume', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (user.resume && user.resume.path) {
      try {
        fs.unlinkSync(user.resume.path);
      } catch (e) {}
    }
    user.resume = undefined;
    await user.save();
    res.json({ message: 'Resume deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;