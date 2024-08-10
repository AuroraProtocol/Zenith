const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js'); // Assurez-vous d'utiliser EmbedBuilder
const ServerCollection = require('../../models/serverConfig'); // Ajustez le chemin

module.exports = {
    data: new SlashCommandBuilder()
        .setName('init')
        .setDescription('Configure le serveur avec les informations de base et un canal de log.')
        .addStringOption(option =>
            option.setName('logchannel')
                .setDescription('ID du canal de log (optionnel)')), // Assurez-vous d'ajouter cette option si vous voulez utiliser logChannelId
    async execute(interaction) {
        // Vérifiez si l'utilisateur a les permissions nécessaires
        if (!interaction.member.permissions.has('ADMINISTRATOR')) {
            return interaction.reply({
                content: "Vous n'avez pas la permission d'exécuter cette commande.",
                ephemeral: true
            });
        }

        const logChannelId = interaction.options.getString('logchannel') || null;

        try {
            // Cherchez si un document pour ce serveur existe déjà
            let server = await ServerCollection.findOne({ serverId: interaction.guild.id });

            if (server) {
                // Mettez à jour le canal de log si un ID est fourni
                server.logChannelId = logChannelId;
                await server.save();
                const embed = new EmbedBuilder()
                    .setColor('#FFFF00')
                    .setTitle('Serveur mis à jour')
                    .setDescription('Les informations du serveur ont été mises à jour.')
                    .addFields([
                        { name: 'ID du serveur', value: interaction.guild.id },
                        { name: 'Canal de log', value: logChannelId || 'Non spécifié' }
                    ])
                    .setTimestamp();
                await interaction.reply({ embeds: [embed] });
            } else {
                // Créez un nouveau document si aucun n'existe
                server = new ServerCollection({
                    serverId: interaction.guild.id,
                    name: interaction.guild.name,
                    createdBy: interaction.user.id,
                    logChannelId: logChannelId
                });

                await server.save();
                const embed = new EmbedBuilder()
                    .setColor('#00FF00')
                    .setTitle('Serveur initialisé')
                    .setDescription('Le serveur a été initialisé avec succès.')
                    .addFields([
                        { name: 'ID du serveur', value: interaction.guild.id },
                        { name: 'Canal de log', value: logChannelId || 'Non spécifié' }
                    ])
                    .setTimestamp();
                await interaction.reply({ embeds: [embed] });
            }
        } catch (error) {
            console.error('Erreur lors de la récupération ou de l\'initialisation des informations du serveur:', error);
            await interaction.reply({
                content: 'Erreur lors de la récupération ou de l\'initialisation des informations du serveur.',
                ephemeral: true
            });
        }
    }
};
