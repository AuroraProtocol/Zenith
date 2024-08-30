// src/handlers/lfgHandler.Js
const Event = require('../models/eventModel');
const { EmbedBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const generateUniqueId = require('../utils/generateUniqueId');
const ServerCollection = require('../models/serverConfig');

module.exports = {

    async handleButtonInteraction(interaction) {
        const [action, eventId] = interaction.customId.split('_');
        const event = await Event.findById(eventId);

        if (!event) {
            await interaction.reply({ content: 'Événement non trouvé.', ephemeral: true });
            return;
        }

        const serverConfig = await ServerCollection.findOne({ serverId: interaction.guild.id });
        let color = serverConfig ? serverConfig.color : '#7C30B8';

        // Assurez-vous que la couleur est au bon format
        if (!/^#[0-9A-Fa-f]{6}$/.test(color)) {
            color = '#7C30B8'; // Couleur par défaut si la couleur de la BDD est invalide
        }

        let userAlreadyInteracted = false;

        switch (action) {
            case 'join':
                if (!event.participants.includes(interaction.user.id)) {
                    if (event.participants.length < event.maxUsers) {
                        event.participants.push(interaction.user.id);
                        event.declined = event.declined.filter(id => id !== interaction.user.id);
                        event.tentative = event.tentative.filter(id => id !== interaction.user.id);
                        await interaction.reply({ content: 'Vous avez rejoint cet événement!', ephemeral: true });
                    } else {
                        await interaction.reply({ content: 'Le nombre maximum de participants est atteint.', ephemeral: true });
                        return;
                    }
                } else {
                    userAlreadyInteracted = true;
                    await interaction.reply({ content: 'Vous êtes déjà inscrit à cet événement.', ephemeral: true });
                }
                break;

            case 'decline':
                if (!event.declined.includes(interaction.user.id)) {
                    event.declined.push(interaction.user.id);
                    event.participants = event.participants.filter(id => id !== interaction.user.id);
                    event.tentative = event.tentative.filter(id => id !== interaction.user.id);
                    await interaction.reply({ content: 'Vous avez décliné cet événement.', ephemeral: true });
                } else {
                    userAlreadyInteracted = true;
                    await interaction.reply({ content: 'Vous avez déjà décliné cet événement.', ephemeral: true });
                }
                break;

            case 'tentative':
                if (!event.tentative.includes(interaction.user.id)) {
                    event.tentative.push(interaction.user.id);
                    event.participants = event.participants.filter(id => id !== interaction.user.id);
                    event.declined = event.declined.filter(id => id !== interaction.user.id);
                    await interaction.reply({ content: 'Vous êtes en tentative pour cet événement!', ephemeral: true });
                } else {
                    userAlreadyInteracted = true;
                    await interaction.reply({ content: 'Vous avez déjà répondu à cet événement.', ephemeral: true });
                }
                break;

            case 'delete':
                if (interaction.user.id !== event.creator) {
                    await interaction.reply({ content: 'Vous n\'êtes pas le créateur de cet événement.', ephemeral: true });
                    return;
                }


                try {
                    await Event.findByIdAndDelete(eventId);
                    await interaction.reply({ content: 'Événement supprimé avec succès.', ephemeral: true });
                    await interaction.message.delete();
                    return;
                } catch (err) {
                    console.error('Erreur lors de la suppression de l\'événement:', err);
                    await interaction.reply({ content: 'Une erreur est survenue lors de la suppression de l\'événement.', ephemeral: true });
                }
                break;

            case 'edit':
                if (interaction.user.id !== event.creator) {
                    await interaction.reply({ content: 'Vous n\'êtes pas le créateur de cet événement.', ephemeral: true });
                    return;
                }
                await showEditModal(interaction, event);
                return;

            default:
                break;
        }

        if (!userAlreadyInteracted) {
            await event.save();
            const updatedEmbed = createEventEmbed(event, interaction.user.username, color);
            await interaction.message.edit({ embeds: [updatedEmbed] });
        }
    },

    async handleModalInteraction(interaction) {
        const [action, eventId] = interaction.customId.split('_');
        const name = interaction.fields.getTextInputValue('nameInput');
        const description = interaction.fields.getTextInputValue('descriptionInput');
        const dateInput = interaction.fields.getTextInputValue('dateInput');
        const imageUrl = interaction.fields.getTextInputValue('imageInput');
        const maxUsers = parseInt(interaction.fields.getTextInputValue('maxUsersInput'), 10);

        const serverConfig = await ServerCollection.findOne({ serverId: interaction.guild.id });
        let color = serverConfig ? serverConfig.color : '#7C30B8';
        // Assurez-vous que la couleur est au bon format
        if (!/^#[0-9A-Fa-f]{6}$/.test(color)) {
            color = '#7C30B8'; // Couleur par défaut si la couleur de la BDD est invalide
        }

        // Pour le moment, on laisse la date comme une chaîne sans validation de format complexe
        const date = new Date(dateInput);

        if (isNaN(date.getTime())) {
            await interaction.reply({ content: 'Date invalide. Veuillez entrer une date au format correct.', ephemeral: true });
            return;
        }

        let event;

        if (action === 'editEventModal') {
            event = await Event.findById(eventId);
            if (!event) {
                await interaction.reply({ content: 'Événement non trouvé.', ephemeral: true });
                return;
            }

            // Mise à jour de l'événement existant
            event.name = name;
            event.description = description;
            event.date = date;
            event.imageUrl = imageUrl.trim() || null;
            event.maxUsers = maxUsers;
            await event.save();

            await interaction.reply({ content: 'Événement modifié avec succès!', ephemeral: true });

            // Mise à jour de l'embed existant
            const updatedEmbed = createEventEmbed(event, interaction.user.username, color);
            const row = createEventActionRow(event._id);

            await interaction.message.edit({ embeds: [updatedEmbed], components: [row] });
        } else {
            // Création d'un nouvel événement
            event = new Event({
                id: generateUniqueId(),
                name,
                description,
                date,
                imageUrl: imageUrl.trim() || null,
                maxUsers,
                color: color,
                creator: interaction.user.id,
                participants: [],
                declined: [],
                tentative: [],
                serverId: interaction.guild.id
            });

            try {
                await event.save();
                await interaction.reply({ content: 'Événement créé avec succès!', ephemeral: true });

                const embed = createEventEmbed(event, interaction.user.username, color);
                const row = createEventActionRow(event._id);

                await interaction.followUp({ embeds: [embed], components: [row] });
            } catch (err) {
                console.error('Erreur lors de la création de l\'événement:', err);
                await interaction.reply({ content: 'Une erreur est survenue lors de la création de l\'événement.', ephemeral: true });
            }
        }
    }
};

async function showEditModal(interaction, event) {
    function formatDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Mois commence à 0, donc ajoutez 1
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');

        return `${year}/${month}/${day} ${hours}:${minutes}`;
    }
    const modal = new ModalBuilder()
        .setCustomId(`editEventModal_${event._id}`)
        .setTitle('Modifier l\'événement');

    const nameInput = new TextInputBuilder()
        .setCustomId('nameInput')
        .setLabel('Nom de l\'événement')
        .setStyle(TextInputStyle.Short)
        .setValue(event.name);

    const descriptionInput = new TextInputBuilder()
        .setCustomId('descriptionInput')
        .setLabel('Description')
        .setStyle(TextInputStyle.Paragraph)
        .setValue(event.description);

    const dateInput = new TextInputBuilder()
        .setCustomId('dateInput')
        .setLabel('Date (AAAA-MM-JJ HH:MM)')
        .setStyle(TextInputStyle.Short)
        .setValue(formatDate(event.date));
    const maxUsersInput = new TextInputBuilder()
        .setCustomId('maxUsersInput')
        .setLabel('Nombre maximum de participants')
        .setStyle(TextInputStyle.Short)
        .setValue(event.maxUsers.toString());

    const imageInput = new TextInputBuilder()
        .setCustomId('imageInput')
        .setLabel('URL de l\'image (optionnel)')
        .setStyle(TextInputStyle.Short)
        .setRequired(false)
        .setValue(event.imageUrl || '');

    modal.addComponents(
        new ActionRowBuilder().addComponents(nameInput),
        new ActionRowBuilder().addComponents(descriptionInput),
        new ActionRowBuilder().addComponents(imageInput),
        new ActionRowBuilder().addComponents(dateInput),
        new ActionRowBuilder().addComponents(maxUsersInput),
    );

    await interaction.showModal(modal);
}

function createEventEmbed(event, username, color) {
    // Assurez-vous que la couleur est au bon format
    color = color || '#7C30B8';
    if (!/^#[0-9A-Fa-f]{6}$/.test(color)) {
        color = '#7C30B8'; // Couleur par défaut si la couleur de la BDD est invalide
    }

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
        .setStyle(ButtonStyle.Secondary);

    const deleteButton = new ButtonBuilder()
        .setCustomId(`delete_${eventId}`)
        .setLabel('Supprimer')
        .setStyle(ButtonStyle.Danger);

    return new ActionRowBuilder()
        .addComponents(joinButton, declineButton, tentativeButton, editButton, deleteButton);
}
