// src/handler/lfgVerseHandler.js
const { EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle, ChannelType } = require('discord.js');
const Event = require('../models/eventModel');
const emojis = require('../config/emojis');
const { updateAllServers } = require('../utils/updateAllServerLfg');
const { createEventEmbed } = require('../utils/eventUtils');

module.exports = {
    async handleLFGVerse(interaction, eventId, targetServerId) {
        try {
            let hasReplied = false;
            const targetServer = await interaction.client.guilds.fetch(targetServerId);

            if (!targetServer) {
                return interaction.reply({
                    content: 'Serveur cible non trouvé. 1 lfgverse',
                    ephemeral: true
                });
            }

            let protocolCategory = targetServer.channels.cache.find(ch => ch.name === 'Protocol Zenith' && ch.type === ChannelType.GuildCategory);
            if (!protocolCategory) {
                protocolCategory = await targetServer.channels.create({
                    name: 'Protocol Zenith',
                    type: ChannelType.GuildCategory,
                });
            }

            let lfgVerseChannel = targetServer.channels.cache.find(ch => ch.name === 'lfg-verse' && ch.parentId === protocolCategory.id);
            if (!lfgVerseChannel) {
                lfgVerseChannel = await targetServer.channels.create({
                    name: 'lfg-verse',
                    type: ChannelType.GuildText,
                    parent: protocolCategory.id
                });
            }

            const originalEvent = await Event.findOne({ eventId: eventId });
            if (!originalEvent) {
                return interaction.reply({
                    content: 'Événement non trouvé. 2 lfgverse',
                    ephemeral: true
                });
            }

            const embed = createEventEmbed(originalEvent, interaction.user.username, originalEvent.color);

            const joinButton = new ButtonBuilder()
                .setCustomId(`join_verse_${eventId}`) // CustomId utilise aussi eventId
                .setLabel('Rejoindre')
                .setStyle(ButtonStyle.Success);

            const declineButton = new ButtonBuilder()
                .setCustomId(`decline_verse_${eventId}`) // CustomId utilise aussi eventId
                .setLabel('Décliner')
                .setStyle(ButtonStyle.Danger);

            const tentativeButton = new ButtonBuilder()
                .setCustomId(`tentative_verse_${eventId}`) // CustomId utilise aussi eventId
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

            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({
                    content: 'L\'événement LFG a été partagé avec succès sur le serveur cible.',
                    ephemeral: true
                });
                hasReplied = true;
            }

        } catch (error) {
            if (!interaction.replied && !interaction.deferred) {
                try {
                    await interaction.reply({
                        content: 'Erreur lors du partage de l\'événement LFG.',
                        ephemeral: true
                    });
                    hasReplied = true;
                } catch (replyError) {
                    console.error('Erreur lors de l\'envoi de la réponse d\'erreur:', replyError);
                }
            }
            console.error('Erreur lors du partage de l\'événement LFG:', error);
        }
    },
    async handleButtonInteraction(interaction) {
        if (!interaction.isButton()) return;

        const [action, eventId, serverId] = interaction.customId.split('_');

        if (action === 'confirm_share') {
            await this.handleLFGVerse(interaction, eventId, serverId);
        } else if (action === 'cancel_share') {
            await interaction.reply({ content: 'Partage annulé.', ephemeral: true });
        }
    },
    async handleButtonInteraction(interaction) {
        if (!interaction.isButton()) return;

        const [action, eventId] = interaction.customId.split('_verse_');

        const event = await Event.findOne({ eventId: eventId });
        if (!event) {
            return interaction.reply({ content: 'Événement non trouvé. 3lfgverse ', ephemeral: true });
        }
        let userAlreadyInteracted = false;
        switch (action) {
            case 'join':
                if (!event.verseParticipants.includes(interaction.user.id) && !event.participants.includes(interaction.user.id)) {
                    if (event.verseParticipants.length < event.maxUsers) {
                        event.verseDeclined = event.verseDeclined.filter(id => id !== interaction.user.id);
                        event.verseTentative = event.verseTentative.filter(id => id !== interaction.user.id);
                        event.verseParticipants.push(interaction.user.id);
                        await updateAllServers(event, interaction.client);
                        await interaction.reply({ content: 'Vous avez rejoint cet événement!', ephemeral: true });
                    } else {
                        userAlreadyInteracted = true;
                        await interaction.reply({ content: 'Le nombre maximum de participants est atteint.', ephemeral: true });
                        return;
                    }
                } else {
                    await interaction.reply({ content: 'Vous avez déjà rejoint cet événement.', ephemeral: true });
                }
                break;
            case 'decline':
                if (!event.verseDeclined.includes(interaction.user.id)) {
                    event.verseParticipants = event.verseParticipants.filter(id => id !== interaction.user.id);
                    event.verseTentative = event.verseTentative.filter(id => id !== interaction.user.id);
                    event.verseDeclined.push(interaction.user.id);
                    await updateAllServers(event, interaction.client);


                    await interaction.reply({ content: 'Vous avez décliné l\'événement.', ephemeral: true });
                } else {
                    userAlreadyInteracted = true;
                    await interaction.reply({ content: 'Vous avez déjà décliné cet événement.', ephemeral: true });
                }
                break;

            case 'tentative':
                if (!event.verseTentative.includes(interaction.user.id)) {
                    event.verseTentative.push(interaction.user.id);
                    event.verseParticipants = event.verseParticipants.filter(id => id !== interaction.user.id);
                    event.verseDeclined = event.verseDeclined.filter(id => id !== interaction.user.id);
                    await updateAllServers(event, interaction.client);
                    await interaction.reply({ content: 'Vous êtes en tentative pour cet événement!', ephemeral: true });
                } else {
                    userAlreadyInteracted = true;
                    await interaction.reply({ content: 'Vous avez déjà répondu à cet événement.', ephemeral: true });
                }
                break;
        }
        if (!userAlreadyInteracted) {

            await event.save();
        }
    },

};
