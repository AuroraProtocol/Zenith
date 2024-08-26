const { SlashCommandBuilder } = require('@discordjs/builders');
const { PermissionsBitField } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('clear')
        .setDescription('Supprime des messages selon les critères spécifiés.')
        .addIntegerOption(option =>
            option.setName('amount')
                .setDescription('Nombre de messages à supprimer')
                .setRequired(true))
        .addUserOption(option =>
            option.setName('except')
                .setDescription('Utilisateur dont les messages ne doivent pas être supprimés'))
        .addUserOption(option =>
            option.setName('only')
                .setDescription('Utilisateur dont les messages doivent être supprimés')),
    async execute(interaction) {
        const amount = interaction.options.getInteger('amount');
        const exceptUser = interaction.options.getUser('except');
        const onlyUser = interaction.options.getUser('only');

        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
            return interaction.reply({ content: 'Vous n\'avez pas la permission de gérer les messages.', ephemeral: true });
        }

        if (amount < 1 || amount > 100) {
            return interaction.reply({ content: 'Vous devez entrer un nombre entre 1 et 100.', ephemeral: true });
        }

        const messages = await interaction.channel.messages.fetch({ limit: amount });

        let filteredMessages = messages.filter(msg => msg.id !== interaction.id);

        if (exceptUser) {
            filteredMessages = filteredMessages.filter(msg => msg.author.id !== exceptUser.id);
        }

        if (onlyUser) {
            filteredMessages = filteredMessages.filter(msg => msg.author.id === onlyUser.id);
        }

        try {
            await interaction.channel.bulkDelete(filteredMessages, true);
            return interaction.reply({ content: `Supprimé ${filteredMessages.size} messages.`, ephemeral: true });
        } catch (error) {
            console.error('Erreur en supprimant les messages:', error);
            return interaction.reply({ content: 'Il y a eu une erreur en supprimant les messages.', ephemeral: true });
        }
    },
};
