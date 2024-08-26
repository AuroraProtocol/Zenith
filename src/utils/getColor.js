// utils/getColor.js

const ServerCollection = require('../models/serverConfig'); // Ajustez le chemin si nécessaire

/**
 * Récupère la couleur de l'embed depuis la base de données pour le serveur donné.
 * @param {string} serverId - ID du serveur Discord.
 * @returns {Promise<string>} - La couleur hexadécimale de l'embed, ou une couleur par défaut.
 */
async function getColor(serverId) {
    try {
        const server = await ServerCollection.findOne({ serverId });
        if (server && /^#[0-9A-Fa-f]{6}$/.test(server.color)) {
            return server.color;
        }
        return '#7C30B8'; // Couleur par défaut si aucune couleur valide n'est trouvée
    } catch (error) {
        console.error('Erreur lors de la récupération de la couleur du serveur:', error);
        return '#7C30B8'; // Couleur par défaut en cas d'erreur
    }
}

module.exports = getColor;
