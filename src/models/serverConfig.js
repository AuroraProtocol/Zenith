// models/serverConfig.js
const mongoose = require('mongoose');

const serverConfigSchema = new mongoose.Schema({
    serverId: { type: String, required: true, unique: true },
    name: { type: String, required: false },
    color: { type: String, default: '#7C30B8' },
    lfgverse: { type: Boolean, default: false }
});

module.exports = mongoose.model('ServerCollection', serverConfigSchema);
