// models/Event.js

const mongoose = require('mongoose');

const sharedServerSchema = new mongoose.Schema({
    serverId: { type: String, required: true }, // Assurez-vous que serverId est une chaîne
    messageId: String,
    channelId: String
});

const eventSchema = new mongoose.Schema({
    eventId: { type: String, required: true, unique: true },
    serverId: { type: String, required: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    date: { type: Date, required: true },
    imageUrl: { type: String },
    maxUsers: { type: Number, required: false },
    color: { type: String, default: '#00ff00' },
    creator: { type: String, required: true },
    participants: { type: [String], default: [] },
    declined: { type: [String], default: [] },
    tentative: { type: [String], default: [] },
    verseParticipants: { type: [String], default: [] },
    verseDeclined: { type: [String], default: [] },
    verseTentative: { type: [String], default: [] },
    reminderSent: { type: Boolean, default: false },
    messageId: { type: String },
    sharedServers: [sharedServerSchema],
});

module.exports = mongoose.model('Event', eventSchema);
