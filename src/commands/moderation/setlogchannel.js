const { SlashCommandBuilder } = require('@discordjs/builders');
const { PermissionsBitField } = require('discord.js');
const ServerConfig = require('../../models/serverConfig'); // Assurez-vous que le chemin est correct

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setlogchannel')
        .setDescription('Définit le canal pour les logs')
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('Le canal à définir pour les logs')
                .setRequired(true)
                .addChannelTypes(0)  // 0 = Text Channels
        ),
    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
            return interaction.reply({
                content: 'Vous n\'avez pas la permission de gérer le serveur.',
                ephemeral: true
            });
        }

        const channel = interaction.options.getChannel('channel');

        // Trouver ou créer une entrée pour le serveur
        let serverConfig = await ServerConfig.findOne({ serverId: interaction.guild.id });

        if (!serverConfig) {
            // Créez une nouvelle entrée avec les informations minimales nécessaires
            serverConfig = new ServerConfig({
                serverId: interaction.guild.id,
                name: interaction.guild.name, // Définir la valeur par défaut si nécessaire
                createdBy: interaction.user.id // Définir la valeur par défaut si nécessaire
            });
        }

        // Met à jour uniquement le canal de log
        serverConfig.logChannelId = channel.id;
        await serverConfig.save();

        return interaction.reply({
            content: `Le canal de logs a été défini sur ${channel}.`,
            ephemeral: true
        });
    }
};
