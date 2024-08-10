// // index.js
// const { Client, GatewayIntentBits, Collection } = require('discord.js');
// const { loadEvents } = require('./handlers/eventHandler');
// const { loadCommands } = require('./handlers/commandHandler');
// const { botConfig } = require('./config/botConfig');
// const connectToDatabase = require('./database');
// const logger = require('./utils/logger');

// const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

// connectToDatabase();
// client.commands = new Collection();

// client.once('ready', async () => {
//     await loadCommands(client);  // Load and register commands
//     loadEvents(client);          // Load and register events
//     // logger.banner(`${client.user.tag}!`);
//     logger.info(`Logged in as ${client.user.tag}`);
// });
// const { loadEvents } = require('./handlers/eventHandler');
// const { loadCommands } = require('./handlers/commandHandler');
const { Client, GatewayIntentBits, Partials } = require('discord.js');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
    partials: [Partials.Channel],
});

require('./connection/loadCommands')(client);
require('./connection/loadEvents')(client);
require('./connection/connectDB')();

client.login(process.env.DISCORD_TOKEN).then(() => {
    // console.log(`Logged in as ${client.user.tag}`);
});

// client.once('ready', async () => {
//         await loadCommands(client);  // Load and register commands
//         loadEvents(client);          // Load and register events
//     });