const { EmbedBuilder } = require('discord.js');
const emojis = require('../config/emojis'); // Assurez-vous que le fichier emojis est bien accessible

const defaultImageUrl = '../img/utils/imgNotfound.png';

function isValidImageUrl(url) {
    try {
        new URL(url);
        return true;
    } catch (error) {
        return false;
    }
}

function createEventEmbed(event, username, color) {
    const totalParticipants = event.participants.length + event.verseParticipants.length;
    const totalDeclined = event.declined.length + event.verseDeclined.length;
    const totalTentative = event.tentative.length + event.verseTentative.length;

    const timestamp = Math.floor(event.date.getTime() / 1000);

    const participantsList = event.participants.length > 0
        ? event.participants.map(id => `> <@${id}>`).join('\n')
        : 'Aucun';

    const declinedList = event.declined.length > 0
        ? event.declined.map(id => `> <@${id}>`).join('\n')
        : 'Aucun';

    const tentativeList = event.tentative.length > 0
        ? event.tentative.map(id => `> <@${id}>`).join('\n')
        : 'Aucun';

    const embed = new EmbedBuilder()
        .setTitle(event.name || 'Événement')
        .setDescription(event.description || 'Pas de description')
        .addFields(
            { name: `${emojis.Timer} Start Time`, value: `<t:${timestamp}:f> - <t:${timestamp}:R>`, inline: false },
            { name: `${emojis.Inscrit} Inscrits | ${totalParticipants}/${event.maxUsers}`, value: participantsList, inline: true },
            { name: `${emojis.Decline} Déclinés | ${totalDeclined}`, value: declinedList, inline: true },
            { name: `${emojis.Tentives} Tentatives | ${totalTentative}`, value: tentativeList, inline: true }
        )
        .setColor(color || '#ffffff')
        .setFooter({ text: `Created by ${username} | Event id: ${event.eventId}` });

    if (event.imageUrl && isValidImageUrl(event.imageUrl)) {
        embed.setThumbnail(event.imageUrl);
    } else if (!event.imageUrl) {
    } else {
        embed.setThumbnail(defaultImageUrl);
    }

    if (event.sharedServers && event.sharedServers.length > 0) {
        const verseParticipantsList = event.verseParticipants.length > 0
            ? event.verseParticipants.map(id => `> <@${id}>`).join('\n')
            : 'Aucun';

        const verseDeclinedList = event.verseDeclined.length > 0
            ? event.verseDeclined.map(id => `> <@${id}>`).join('\n')
            : 'Aucun';

        const verseTentativeList = event.verseTentative.length > 0
            ? event.verseTentative.map(id => `> <@${id}>`).join('\n')
            : 'Aucun';

        embed.addFields(
            { name: `${emojis.Inscrit} Participants Verse`, value: verseParticipantsList, inline: true },
            { name: `${emojis.Decline} Déclinés Verse`, value: verseDeclinedList, inline: true },
            { name: `${emojis.Tentives} Tentatives Verse`, value: verseTentativeList, inline: true }
        );
    }

    return embed;
}
module.exports = {
    createEventEmbed
};