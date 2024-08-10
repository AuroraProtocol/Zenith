// utils/generateUniqueId.js
const crypto = require('crypto');

module.exports = function generateUniqueId() {
    return crypto.randomBytes(6).toString('hex'); // Génère un ID unique en hex
};
