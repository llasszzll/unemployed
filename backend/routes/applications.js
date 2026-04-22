const express = require("express");
const Application = require("../models/Application");
const { authenticate } = require("../middleware/auth");
const User = require("../models/User");
const mongoose = require("mongoose");
const generateProfileId = () => Math.random().toString(36).substring(2, 10);

const router = express.Router();
router.get("/", authenticate, async (req, res) => {
    try {
        const applications = await Application.find({ user: req.userId }).sort({
            createdAt: -1,
        });
        res.json(applications);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});
router.post("/", authenticate, async (req, res) => {
    try {
        const {
            companyName,
            position,
            applicationDate,
            status,
            feedback,
            rejectionReason,
            notes,
        } = req.body;
        const application = new Application({
            user: req.userId,
            companyName,
            position,
            applicationDate,
            status,
            feedback,
            rejectionReason,
            notes,
        });
        await application.save();
        res.status(201).json(application);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});
router.put("/:id", authenticate, async (req, res) => {
    try {
        const application = await Application.findOne({
            _id: req.params.id,
            user: req.userId,
        });
        if (!application)
            return res.status(404).json({ message: "Application not found" });
        Object.assign(application, req.body);
        await application.save();
        res.json(application);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});
router.delete("/:id", authenticate, async (req, res) => {
    try {
        const application = await Application.findOneAndDelete({
            _id: req.params.id,
            user: req.userId,
        });
        if (!application)
            return res.status(404).json({ message: "Application not found" });
        res.json({ message: "Application deleted" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});
module.exports = router;
