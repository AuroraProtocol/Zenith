const { SlashCommandBuilder } = require('discord.js');
const emojis = require('../../config/emojis');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Replies with Pong!'),
    async execute(interaction) {
        await interaction.reply(`Pong! ${emojis.zenith1}`);
    },
};
