const mongoose = require('mongoose');

const serverSchema = new mongoose.Schema({
    serverId: { type: String, unique: true, required: true },
    name: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    createdBy: { type: String, required: true },
    logChannelId: { type: String }, // Pour les logs
    events: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Events' }] // Référence aux événements
});

module.exports = mongoose.model('ServerCollection', serverSchema);
