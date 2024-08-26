const { EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require('discord.js');

function createEventEmbed(event, username) {
    const participantsList = event.participants.length > 0
        ? event.participants.map(id => `> <@${id}>`).join('\n')
        : 'Vide';

    const declinedList = event.declined.length > 0
        ? event.declined.map(id => `> <@${id}>`).join('\n')
        : 'Vide';

    const tentativeList = event.tentative.length > 0
        ? event.tentative.map(id => `> <@${id}>`).join('\n')
        : 'Vide';

    const embed = new EmbedBuilder()
        .setTitle(`${event.name}`)
        .setDescription(event.description)
        .addFields(
            { name: 'Start Time', value: `<t:${Math.floor(event.date.getTime() / 1000)}:F>`, inline: false },
            { name: '\u200B', value: '\u200B', inline: false },
            { name: `Inscrits | ${event.participants.length}/${event.maxUsers}`, value: participantsList, inline: true },
            { name: `Déclinés | ${event.declined.length}`, value: declinedList, inline: true },
            { name: `Tentatives | ${event.tentative.length}`, value: tentativeList, inline: true }
        )
        .setColor(color)
        .setFooter({ text: `Created by ${username}\u2003\u2003|\u2003\u2003Event id: ${event.id}` });

    if (event.imageUrl) {
        embed.setThumbnail(event.imageUrl);
    }

    return embed;
}

function createEventActionRow(eventId) {
    const joinButton = new ButtonBuilder()
        .setCustomId(`join_${eventId}`)
        .setLabel('Rejoindre')
        .setStyle(ButtonStyle.Success);

    const declineButton = new ButtonBuilder()
        .setCustomId(`decline_${eventId}`)
        .setLabel('Décliner')
        .setStyle(ButtonStyle.Danger);

    const tentativeButton = new ButtonBuilder()
        .setCustomId(`tentative_${eventId}`)
        .setLabel('Tentative')
        .setStyle(ButtonStyle.Primary);

    const editButton = new ButtonBuilder()
        .setCustomId(`edit_${eventId}`)
        .setLabel('Modifier')
        .setStyle(ButtonStyle.Secondary)
        // .setDisabled(true);

    const deleteButton = new ButtonBuilder()
        .setCustomId(`delete_${eventId}`)
        .setLabel('Supprimer')
        .setStyle(ButtonStyle.Danger);

    return new ActionRowBuilder()
        .addComponents(joinButton, declineButton, tentativeButton, editButton, deleteButton);
}

module.exports = { createEventEmbed, createEventActionRow };
