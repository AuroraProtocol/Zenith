const lfgHandler = require('../handlers/lfgHandler');
const lfgverseHandler = require('../handlers/lfgVerseHandler');

module.exports = {
    name: 'interactionCreate',
    async execute(interaction, client) {
        if (interaction.isCommand()) {
            const command = client.commands.get(interaction.commandName);
            if (command) {
                await command.execute(interaction);
            }
        } else if (interaction.isModalSubmit()) {
            await lfgHandler.handleModalInteraction(interaction);
        } else if (interaction.isButton()) {
            // Vérification si le bouton concerne un événement "verse"
            if (interaction.customId.includes('_verse_')) {
                // Utilise le lfgVerseHandler pour les événements partagés
                await lfgverseHandler.handleButtonInteraction(interaction);
            } else {
                // Utilise le lfgHandler pour les événements normaux
                await lfgHandler.handleButtonInteraction(interaction);
            }
        } else if (interaction.isStringSelectMenu()) {
            await lfgverseHandler.handleSelectMenuInteraction(interaction);
        }
    },
};
// const { EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle, ChannelType } = require('discord.js');
// const lfgHandler = require('../handlers/lfgHandler');
// const lfgverseHandler = require('../handlers/lfgVerseHandler');
// const Event = require('../models/eventModel');

// module.exports = {
//     name: 'interactionCreate',
//     async execute(interaction, client) {
//         if (interaction.isCommand()) {
//             const command = client.commands.get(interaction.commandName);
//             if (command) {
//                 await command.execute(interaction);
//             }
//         } else if (interaction.isModalSubmit()) {
//             await lfgHandler.handleModalInteraction(interaction);
//         } else if (interaction.isButton()) {
//             // Vérification si le bouton concerne un événement "verse"
//             if (interaction.customId.includes('_verse_')) {
//                 // Utilise le lfgVerseHandler pour les événements partagés
//                 await lfgverseHandler.handleButtonInteraction(interaction);
//             } else if (interaction.customId.startsWith('confirm_share_')) {
//                 // Extraire l'ID de l'événement et du serveur à partir du customId du bouton
//                 const [_, eventId, serverId] = interaction.customId.split('_').slice(2);

//                 // Cherche l'événement dans la base de données
//                 const event = await Event.findOne({ eventId: eventId });
//                 if (!event) {
//                     return await interaction.reply({ content: 'Erreur : événement non trouvé.', ephemeral: true });
//                 }

//                 // Ici, tu peux passer la gestion à lfgHandler pour gérer le partage
//                 await lfgverseHandler.shareEventToServer(event, serverId);

//                 return await interaction.reply({ content: `L'événement a été partagé sur le serveur ${serverId}`, ephemeral: true });
//             } else {
//                 // Utilise le lfgHandler pour les événements normaux
//                 await lfgHandler.handleButtonInteraction(interaction);
//             }
//         } else if (interaction.isStringSelectMenu()) {
//             const { customId, values } = interaction;

//             // Gestion des sélections d'événements et de serveurs
//             if (customId === 'select_event') {
//                 const selectedEventId = values[0]; // Stocke l'ID de l'événement sélectionné
//                 interaction.user.selectedEventId = selectedEventId; // Si tu veux toujours l'utiliser comme ça

//                 return await interaction.reply({ content: 'Événement sélectionné : ' + selectedEventId, ephemeral: true });
//             }

//             if (customId === 'select_server') {
//                 const selectedServerId = values[0];
//                 const selectedEventId = interaction.user.selectedEventId; // Toujours récupéré ici

//                 if (!selectedEventId) {
//                     return await interaction.reply({ content: 'Veuillez d\'abord sélectionner un événement.', ephemeral: true });
//                 }

//                 // Message de confirmation avec les IDs d'événement et de serveur dans le customId du bouton
//                 await interaction.reply({
//                     content: `Vous avez sélectionné l'événement avec l'ID : ${selectedEventId} et le serveur : ${selectedServerId}. Souhaitez-vous confirmer le partage ?`,
//                     ephemeral: true,
//                     components: [
//                         new ActionRowBuilder().addComponents(
//                             new ButtonBuilder()
//                                 .setCustomId(`confirm_share_${selectedEventId}_${selectedServerId}`)
//                                 .setLabel('Confirmer')
//                                 .setStyle(ButtonStyle.Success),
//                             new ButtonBuilder()
//                                 .setCustomId('cancel_share')
//                                 .setLabel('Annuler')
//                                 .setStyle(ButtonStyle.Danger)
//                         )
//                     ]
//                 });
//             }
//         }
//     }
// }