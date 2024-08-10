const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('commandes')
        .setDescription('Affiche toutes les commandes disponibles du bot.'),
    async execute(interaction) {
        const { client } = interaction;

        const commands = Array.from(client.commands.values()); // Récupère toutes les commandes
        const itemsPerPage = 5; // Nombre de commandes par page
        let currentPage = 0; // Page actuelle

        // Fonction pour générer l'embed pour la page actuelle
        const generateEmbed = (page) => {
            const embed = new EmbedBuilder()
                .setTitle('Commandes disponibles')
                .setDescription('Voici la liste des commandes disponibles sur ce bot.')
                .setColor('#00ff00');

            const start = page * itemsPerPage;
            const end = start + itemsPerPage;
            const paginatedCommands = commands.slice(start, end);

            if (paginatedCommands.length === 0) {
                embed.setDescription('Aucune commande disponible.');
            } else {
                paginatedCommands.forEach(command => {
                    embed.addFields({ name: `/${command.data.name}`, value: command.data.description });
                });
            }

            embed.setFooter({ text: `Page ${page + 1} sur ${Math.ceil(commands.length / itemsPerPage)}` });

            return embed;
        };

        // Fonction pour générer les boutons de pagination
        const generateButtons = (page) => {
            return new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('previous')
                        .setLabel('⬅️ Précédent')
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(page === 0),
                    new ButtonBuilder()
                        .setCustomId('next')
                        .setLabel('➡️ Suivant')
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(page === Math.ceil(commands.length / itemsPerPage) - 1)
                );
        };

        // Envoi du premier embed avec les boutons
        await interaction.reply({
            embeds: [generateEmbed(currentPage)],
            components: [generateButtons(currentPage)],
            ephemeral: true
        });

        // Création du collecteur pour les interactions de boutons
        const collector = interaction.channel.createMessageComponentCollector({
            filter: i => i.user.id === interaction.user.id,
            time: 60000
        });

        collector.on('collect', async i => {
            if (i.customId === 'previous') {
                currentPage = Math.max(currentPage - 1, 0);
            } else if (i.customId === 'next') {
                currentPage = Math.min(currentPage + 1, Math.ceil(commands.length / itemsPerPage) - 1);
            }

            await i.update({
                embeds: [generateEmbed(currentPage)],
                components: [generateButtons(currentPage)]
            });
        });

        collector.on('end', collected => {
            interaction.editReply({
                components: []
            });
        });
    },
};
