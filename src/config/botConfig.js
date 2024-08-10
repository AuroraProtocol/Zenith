require('dotenv').config();

module.exports.botConfig = {
    token: process.env.DISCORD_TOKEN,
    client: process.env.DISCORD_CLIENT_ID
};
