// models/serverConfig.js
const mongoose = require('mongoose');

const userStatsSchema = new mongoose.Schema({
    messageCount: { type: Number, default: 0 },
    messageEdit: { type: Number, default: 0 },
    messageDelete: { type: Number, default: 0 },
    imageUpload: { type: Number, default: 0 },
    reactionAdd: { type: Number, default: 0 },
    reactionRemove: { type: Number, default: 0 }
});
const serverConfigSchema = new mongoose.Schema({
    serverId: { type: String, required: true, unique: true },
    name: { type: String, required: false },
    color: { type: String, default: '#7C30B8' },
    lfgverse: { type: Boolean, default: false },
    stats: {
        type: Map,
        of: userStatsSchema,
        default: {}
    }
});

module.exports = mongoose.model('ServerCollection', serverConfigSchema);
