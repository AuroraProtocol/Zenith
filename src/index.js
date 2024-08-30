
const { Client, GatewayIntentBits, Partials } = require('discord.js');
const connectToDatabase = require('./database');
const path = require('path');
const startReminderService = require('../src/utils/reminderScheduler');
require('dotenv').config();

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
    partials: [Partials.Channel],
});

client.on('messageCreate', async message => {
    require(path.join(__dirname, 'events/messages/messageCreate')).execute(client, message);
});
// client.on('messageCreate', async message => {
//     require('./events/messages/messageCreate').execute(client, message);
// });

require('./connection/loadCommands')(client);
require('./connection/loadEvents')(client);
connectToDatabase();

client.login(process.env.DISCORD_TOKEN);