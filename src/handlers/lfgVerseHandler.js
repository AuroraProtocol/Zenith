// src/handlers/lfgVerseHandler.js
const { EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require('discord.js');
const lfgHandler = require('./lfgHandler'); 
const Event = require('../models/eventModel'); 

module.exports = {
    async handleLFGVerse(interaction, eventId, targetServerId) {
        try {
            const targetServer = await interaction.client.guilds.fetch(targetServerId);

            if (!targetServer) {
                return interaction.reply({
                    content: 'Serveur cible non trouvé.',
                    ephemeral: true
                });
            }

            let protocolCategory = targetServer.channels.cache.find(ch => ch.name === 'Protocol' && ch.type === 4);
            if (!protocolCategory) {
                protocolCategory = await targetServer.channels.create({
                    name: 'Protocol',
                    type: 4,
                });
            }

            let lfgVerseChannel = targetServer.channels.cache.find(ch => ch.name === 'lfg-verse' && ch.parentId === protocolCategory.id);
            if (!lfgVerseChannel) {
                lfgVerseChannel = await targetServer.channels.create({
                    name: 'lfg-verse',
                    type: 'GUILD_TEXT',
                    parent: protocolCategory.id
                });
            }

            const originalEvent = await Event.findById(eventId);
            if (!originalEvent) {
                return interaction.reply({
                    content: 'Événement non trouvé.',
                    ephemeral: true
                });
            }

            const embed = createEventEmbed(originalEvent, interaction.user.username, originalEvent.color);

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

            const row = new ActionRowBuilder().addComponents(joinButton, declineButton, tentativeButton);

            const eventMessage = await lfgVerseChannel.send({ embeds: [embed], components: [row] });

            originalEvent.sharedServers.push({
                serverId: targetServerId,
                messageId: eventMessage.id,
                channelId: lfgVerseChannel.id
            });

            await originalEvent.save();

            await interaction.reply({
                content: 'L\'événement LFG a été partagé avec succès sur le serveur cible.',
                ephemeral: true
            });

        } catch (error) {
            console.error('Erreur lors du partage de l\'événement LFG:', error);
            await interaction.reply({
                content: 'Erreur lors du partage de l\'événement LFG.',
                ephemeral: true
            });
        }
    }
};

function createEventEmbed(event, username, color) {
    const timestamp = Math.floor(event.date.getTime() / 1000);

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
            { name: 'Start Time', value: `<t:${timestamp}:f>`, inline: false },
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
