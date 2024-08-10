const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('info')
        .setDescription('Provides information about the bot.'),
    async execute(interaction) {

        await interaction.reply('This bot is a demonstration of a Discord bot built in JavaScript.');
    },
};

