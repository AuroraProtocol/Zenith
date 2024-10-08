const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const ServerCollection = require('../../models/serverConfig');

function isValidHexColor(color) {
    const hexColorRegex = /^#[0-9A-Fa-f]{6}$/;
    return hexColorRegex.test(color);
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('init')
        .setDescription('Configure le serveur avec les informations de base')
        .addStringOption(option =>
            option.setName('color')
                .setDescription('Couleur des embeds en format hexadécimal (optionnel)'))
        .addBooleanOption(option =>
            option.setName('lfgverse')
                .setDescription('Activer ou désactiver le LFG multi-serveurs')
        ),

    async execute(interaction) {
        // Vérifiez si l'utilisateur a les permissions nécessaires
        if (!interaction.member.permissions.has('ADMINISTRATOR')) {
            return interaction.reply({
                content: "Vous n'avez pas la permission d'exécuter cette commande.",
                ephemeral: true
            });
        }

        let colorEmbed = interaction.options.getString('color') || '#7C30B8';
        const lfgverse = interaction.options.getBoolean('lfgverse') || false; // Désactivé par défaut

        if (!colorEmbed.startsWith('#')) {
            colorEmbed = `#${colorEmbed}`;
        }
        if (!isValidHexColor(colorEmbed)) {
            return interaction.reply({
                content: 'La couleur spécifiée n\'est pas valide. Veuillez entrer une couleur hexadécimale valide (ex: #RRGGBB).',
                ephemeral: true
            });
        }
        try {
            let server = await ServerCollection.findOne({ serverId: interaction.guild.id });

            if (server) {
                server.color = colorEmbed;
                server.lfgverse = lfgverse; // Mettez à jour lfgverse
                await server.save();
                const embed = new EmbedBuilder()
                    .setColor(colorEmbed)
                    .setTitle('Serveur mis à jour')
                    .setDescription('Les informations du serveur ont été mises à jour.')
                    .setThumbnail(interaction.guild.iconURL())
                    .addFields([
                        { name: 'Nom du serveur', value: interaction.guild.name },
                        { name: 'ID du serveur', value: interaction.guild.id },
                        { name: 'Couleur des embeds', value: colorEmbed },
                        { name: 'LFG Multi-serveurs', value: lfgverse ? 'Activé' : 'Désactivé' }
                    ])
                    .setFooter({ text: `Mis à jour par ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL() })
                    .setTimestamp()

                await interaction.reply({ embeds: [embed] });
            } else {
                server = new ServerCollection({
                    serverId: interaction.guild.id,
                    name: interaction.guild.name,
                    color: colorEmbed,
                    lfgverse: lfgverse // Nouveau champ pour LFG multi-serveurs
                });

                await server.save();
                const embed = new EmbedBuilder()
                    .setColor(colorEmbed)
                    .setTitle('Serveur initialisé')
                    .setDescription('Le serveur a été initialisé avec succès.')
                    .setThumbnail(interaction.guild.iconURL())
                    .addFields([
                        { name: 'Nom du serveur', value: interaction.guild.name },
                        { name: 'ID du serveur', value: interaction.guild.id },
                        { name: 'Couleur des embeds', value: colorEmbed },
                        { name: 'LFG Multi-serveurs', value: lfgverse ? 'Activé' : 'Désactivé' }
                    ])
                    .setFooter({ text: `Initialisé par ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL() })
                    .setTimestamp()

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