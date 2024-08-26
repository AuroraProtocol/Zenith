// commands/event/createEvent.js
const { SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('lfg')
        .setDescription('Créer un nouvel événement'),
    async execute(interaction) {
        const modal = new ModalBuilder()
            .setCustomId('eventModal')
            .setTitle('Créer un événement');

        const nameInput = new TextInputBuilder()
            .setCustomId('nameInput')
            .setLabel("Nom de l'événement")
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        const descriptionInput = new TextInputBuilder()
            .setCustomId('descriptionInput')
            .setLabel('Description')
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true);

        const imageInput = new TextInputBuilder()
            .setCustomId('imageInput')
            .setLabel('URL de l\'image')
            .setStyle(TextInputStyle.Short)
            .setRequired(false);

        const dateInput = new TextInputBuilder()
            .setCustomId('dateInput')
            .setLabel('Date (AAAA-MM-JJ HH:MM)')
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        const maxUsersInput = new TextInputBuilder()
            .setCustomId('maxUsersInput')
            .setLabel('Nombre maximum de participants')
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        modal.addComponents(
            new ActionRowBuilder().addComponents(nameInput),
            new ActionRowBuilder().addComponents(descriptionInput),
            new ActionRowBuilder().addComponents(imageInput),
            new ActionRowBuilder().addComponents(dateInput),
            new ActionRowBuilder().addComponents(maxUsersInput),
        );

        await interaction.showModal(modal);
    },
};
