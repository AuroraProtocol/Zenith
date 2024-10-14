const { createEventEmbed } = require('../utils/eventUtils');
const { EmbedBuilder } = require('discord.js');
const Event = require('../models/eventModel');


async function updateAllServers(event, client) {
    for (const shared of event.sharedServers) {
        try {
            if (!shared.serverId || !shared.channelId || !shared.messageId) {
                console.error(`Identifiants invalides pour le serveur ${shared.serverId}`);
                continue;
            }
            const targetServer = await client.guilds.fetch(shared.serverId).catch(() => {
                console.error(`Impossible de trouver le serveur : ${shared.serverId}`);
                return null;
            });
            if (!targetServer) continue;

            const channel = await targetServer.channels.fetch(shared.channelId).catch(() => {
                console.error(`Impossible de trouver le canal : ${shared.channelId}`);
                return null;
            });
            if (!channel) continue;

            const botMember = await targetServer.members.fetch(client.user.id);
            if (!channel.permissionsFor(botMember).has('MANAGE_MESSAGES')) {
                console.error(`Permissions insuffisantes pour modifier les messages dans le canal : ${shared.channelId}`);
                continue;
            }

            const message = await channel.messages.fetch(shared.messageId).catch(() => {
                console.error(`Impossible de trouver le message : ${shared.messageId}`);
                return null;
            });
            if (!message) continue;

            const updatedEmbed = createEventEmbed(event, client.user.username, event.color);

            await message.edit({ embeds: [updatedEmbed] }).catch((err) => {
                console.error(`Erreur lors de la mise à jour du message ${shared.messageId} sur le serveur ${shared.serverId}:`, err);
            });

        } catch (error) {
            console.error(`Erreur lors de la mise à jour du message pour le serveur ${shared.serverId}:`, error);
        }
    }
}


module.exports = { updateAllServers };
