// src/commands/Event/lfgverse.Js
const { SlashCommandBuilder } = require('@discordjs/builders');
const lfgVerseHandler = require('../../handlers/lfgverseHandler');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('lfgverse')
        .setDescription('Partager un événement LFG entre serveurs')
        .addStringOption(option =>
            option.setName('idevent')
                .setDescription('L\'ID de l\'événement LFG à partager')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('serverid')
                .setDescription('L\'ID du serveur cible où partager l\'événement')
                .setRequired(true)),

    async execute(interaction) {
        const eventId = interaction.options.getString('idevent');
        const targetServerId = interaction.options.getString('serverid');
        await lfgVerseHandler.handleLFGVerse(interaction, eventId, targetServerId);
    }
};
