// src/commands/Event/lfgverse.js

const { SlashCommandBuilder } = require('@discordjs/builders');
const Event = require('../../models/eventModel');
const ServerCollection = require('../../models/serverConfig');
const lfgverseHandler = require('../../handlers/lfgVerseHandler');
const mongoose = require('mongoose');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('lfgverse')
        .setDescription('Partager un événement LFG entre serveurs')
        .addStringOption(option =>
            option.setName('eventid')
                .setDescription('L\'ID de l\'événement LFG à partager')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('serverid')
                .setDescription('L\'ID du serveur cible où partager l\'événement')
                .setRequired(true)),

    async execute(interaction) {
        const eventId = interaction.options.getString('eventid');
        const targetServerId = interaction.options.getString('serverid');
        const event = await Event.findOne({ eventId });
        if (!event) {
            await interaction.reply({ content: 'Événement non trouvé.', ephemeral: true });
            return;
        }
        const serverConfig = await ServerCollection.findOne({ serverId: targetServerId });
        if (!serverConfig || !serverConfig.lfgverse) {
            await interaction.reply({ content: 'Le LFG Verse n\'est pas activé sur le serveur cible.', ephemeral: true });
            return;
        }
        if (event.sharedServers.includes(targetServerId)) {
            await interaction.reply({ content: 'Cet événement est déjà partagé sur le serveur cible.', ephemeral: true });
            return;
        }
        event.sharedServers.push({ serverId: targetServerId });
        await event.save();

        await interaction.reply({ content: 'Événement partagé avec succès sur le serveur cible.', ephemeral: true });
        await lfgverseHandler.handleLFGVerse(interaction, eventId, targetServerId);
    },


};
// src/commands/Event/lfgverse.js
// const { SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
// const Event = require('../../models/eventModel');
// const ServerCollection = require('../../models/serverConfig');
// const lfgverseHandler = require('../../handlers/lfgVerseHandler');

// module.exports = {
//     data: new SlashCommandBuilder()
//         .setName('lfgverse')
//         .setDescription('Partager un événement LFG entre serveurs'),

//     async execute(interaction) {
//         // Récupérer tous les événements du serveur actuel
//         const events = await Event.find({ serverId: interaction.guildId });
//         // console.log('Événements récupérés :', events);

//         if (!events || events.length === 0) {
//             return await interaction.reply({ content: 'Aucun événement LFG disponible.', ephemeral: true });
//         }

//         // Limite à 25 événements pour éviter l'erreur
//         const eventOptions = events
//             .filter(event => event.name && event.eventId) // Vérifiez que les événements ont un nom et un ID
//             .slice(0, 25) // Limite à 25 options
//             .map(event => ({
//                 label: event.name,  // Assurez-vous que c'est le bon champ
//                 value: event.eventId
//             }));

//         console.table('Options d\'événements :', eventOptions);

//         // Récupérer les serveurs avec LFG Verse activé
//         const servers = await ServerCollection.find({ lfgverse: true });
//         // console.log('Serveurs récupérés :', servers);

//         if (!servers || servers.length === 0) {
//             return await interaction.reply({ content: 'Aucun serveur avec LFG Verse activé.', ephemeral: true });
//         }

//         // Limite à 25 serveurs pour éviter l'erreur
//         const serverOptions = servers
//             .filter(server => server.name && server.serverId) // Vérifiez que les serveurs ont un nom et un ID
//             .slice(0, 25) // Limite à 25 options
//             .map(server => ({
//                 label: server.name,  // Assurez-vous que c'est le bon champ
//                 value: server.serverId
//             }));

//         console.table('Options de serveurs :', serverOptions);

//         if (eventOptions.length === 0 || serverOptions.length === 0) {
//             return await interaction.reply({ content: 'Aucune option disponible pour les événements ou les serveurs.', ephemeral: true });
//         }

//         // Créer un menu de sélection pour choisir un événement LFG
//         const eventSelectMenu = new StringSelectMenuBuilder()
//             .setCustomId('select_event')
//             .setPlaceholder('Choisir un événement LFG')
//             .addOptions(eventOptions);

//         // Créer un menu de sélection pour choisir un serveur cible
//         const serverSelectMenu = new StringSelectMenuBuilder()
//             .setCustomId('select_server')
//             .setPlaceholder('Choisir un serveur cible')
//             .addOptions(serverOptions);

//         // Envoyer les deux menus de sélection
//         const row1 = new ActionRowBuilder().addComponents(eventSelectMenu);
//         const row2 = new ActionRowBuilder().addComponents(serverSelectMenu);

//         await interaction.reply({
//             content: 'Sélectionnez un événement LFG et un serveur où le partager :',
//             components: [row1, row2],
//             ephemeral: true
//         });
//     }
// };
