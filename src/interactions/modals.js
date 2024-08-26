// srx/interactions/modals.js
const Event = require('../models/eventModel');
const { createEventEmbed, createEventActionRow } = require('../interactions/buttons');
const generateUniqueId = require('../utils/generateUniqueId');

module.exports = async (interaction) => {
    if (interaction.customId === 'eventModal') {
        const name = interaction.fields.getTextInputValue('nameInput');
        const description = interaction.fields.getTextInputValue('descriptionInput');
        const date = new Date(interaction.fields.getTextInputValue('dateInput'));
        const imageUrl = interaction.fields.getTextInputValue('imageInput');
        const maxUsers = parseInt(interaction.fields.getTextInputValue('maxUsersInput'), 10);
        const creator = interaction.user.id;
 
        const serverConfig = await ServerCollection.findOne({ serverId: interaction.guild.id });
        const color = serverConfig ? serverConfig.color : '#7C30B8';

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
};
