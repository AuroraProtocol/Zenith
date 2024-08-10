// events/interactionCreate.js
const Event = require('../models/eventModel');
const { EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require('discord.js');
const generateUniqueId = require('../utils/generateUniqueId');

module.exports = {
    name: 'interactionCreate',
    async execute(interaction, client) {
        if (interaction.isCommand()) {
            const command = client.commands.get(interaction.commandName);
            if (command) {
                await command.execute(interaction);
            }
        } else if (interaction.isModalSubmit()) {
            if (interaction.customId === 'eventModal') {
                const name = interaction.fields.getTextInputValue('nameInput');
                const description = interaction.fields.getTextInputValue('descriptionInput');
                const date = new Date(interaction.fields.getTextInputValue('dateInput'));
                const imageUrl = interaction.fields.getTextInputValue('imageInput');
                const maxUsers = parseInt(interaction.fields.getTextInputValue('maxUsersInput'), 10);
                const color = '#00ff00';
                const creator = interaction.user.id;

                const newEvent = new Event({
                    id: generateUniqueId(),
                    name,
                    description,
                    date,
                    imageUrl: imageUrl.trim() || null,
                    maxUsers,
                    color,
                    creator,
                    participants: [],
                    declined: [],
                    tentative: [],
                });

                try {
                    await newEvent.save();
                    await interaction.reply({ content: 'Événement créé avec succès!', ephemeral: true });
                } catch (err) {
                    console.error('Erreur lors de la création de l\'événement:', err);
                    await interaction.reply({ content: 'Une erreur est survenue lors de la création de l\'événement.', ephemeral: true });
                }

                const embed = createEventEmbed(newEvent, interaction.user.username);
                const row = createEventActionRow(newEvent._id);

                await interaction.followUp({ embeds: [embed], components: [row] });
            }
        } else if (interaction.isButton()) {
            const [action, eventId] = interaction.customId.split('_');
            const event = await Event.findById(eventId);

            if (action === 'join') {
                if (!event.participants.includes(interaction.user.id)) {
                    if (event.participants.length < event.maxUsers) {
                        event.participants.push(interaction.user.id);
                        event.declined = event.declined.filter(id => id !== interaction.user.id);
                        event.tentative = event.tentative.filter(id => id !== interaction.user.id);
                        await event.save();
                        await interaction.reply({ content: 'Vous avez rejoint cet événement!', ephemeral: true });
                    } else {
                        await interaction.reply({ content: 'Le nombre maximum de participants est atteint.', ephemeral: true });
                    }
                } else {
                    await interaction.reply({ content: 'Vous êtes déjà inscrit à cet événement.', ephemeral: true });
                }
            } else if (action === 'decline') {
                if (!event.declined.includes(interaction.user.id)) {
                    event.declined.push(interaction.user.id);
                    event.participants = event.participants.filter(id => id !== interaction.user.id);
                    event.tentative = event.tentative.filter(id => id !== interaction.user.id);
                    await event.save();
                    await interaction.reply({ content: 'Vous avez décliné cet événement.', ephemeral: true });
                } else {
                    await interaction.reply({ content: 'Vous avez déjà décliné cet événement.', ephemeral: true });
                }
            } else if (action === 'tentative') {
                if (!event.tentative.includes(interaction.user.id)) {
                    event.tentative.push(interaction.user.id);
                    event.participants = event.participants.filter(id => id !== interaction.user.id);
                    event.declined = event.declined.filter(id => id !== interaction.user.id);
                    await event.save();
                    await interaction.reply({ content: 'Vous êtes en tentative pour cet événement!', ephemeral: true });
                } else {
                    await interaction.reply({ content: 'Vous avez déjà répondu à cet événement.', ephemeral: true });
                }
            }

            const embed = createEventEmbed(event, interaction.user.username);
            await interaction.message.edit({ embeds: [embed] });
        }
    },
};

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
        .setColor(event.color)
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
        .setStyle(ButtonStyle.Secondary);

    const editButton = new ButtonBuilder()
        .setCustomId(`edit_${eventId}`)
        .setLabel('Modifier')
        .setStyle(ButtonStyle.Primary);

    const declineButton = new ButtonBuilder()
        .setCustomId(`decline_${eventId}`)
        .setLabel('Décliner')
        .setStyle(ButtonStyle.Secondary);

    const tentativeButton = new ButtonBuilder()
        .setCustomId(`tentative_${eventId}`)
        .setLabel('Tentative')
        .setStyle(ButtonStyle.Secondary);

    return new ActionRowBuilder()
        .addComponents(joinButton, declineButton, tentativeButton, editButton);
}
