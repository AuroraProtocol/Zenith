
const { Client, GatewayIntentBits, Partials } = require('discord.js');
const connectToDatabase = require('./database');
require('dotenv').config();

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
    partials: [Partials.Channel],
});



require('./connection/loadCommands')(client);
require('./connection/loadEvents')(client);
// require('./connection/connectDB')();
connectToDatabase();
client.login(process.env.DISCORD_TOKEN).then(() => {
    // console.log(`Logged in as ${client.user.tag}`);
});