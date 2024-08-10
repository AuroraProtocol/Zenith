// models/Event.js

const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    date: { type: Date, required: true },
    imageUrl: { type: String },
    maxUsers: { type: Number, required: false },
    color: { type: String, default: '#00ff00' },
    creator: { type: String, required: true },
    participants: { type: [String], default: [] }, // Participants inscrits
    declined: { type: [String], default: [] },     // Participants ayant décliné
    tentative: { type: [String], default: [] }     // Participants en tentative
});

module.exports = mongoose.model('Event', eventSchema);
