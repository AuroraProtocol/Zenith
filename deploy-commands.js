const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Charge les variables d'environnement depuis le fichier .env
const { DISCORD_CLIENT_ID, GUILD_ID, DISCORD_TOKEN } = process.env;

// Récupère tous les fichiers de commandes dans le répertoire ./src/commands
const commands = [];
const commandFolders = fs.readdirSync(path.join(__dirname, 'src', 'commands'));

for (const folder of commandFolders) {
    const commandFiles = fs.readdirSync(path.join(__dirname, 'src', 'commands', folder)).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const command = require(`./src/commands/${folder}/${file}`);
        commands.push(command.data.toJSON());
    }
}

const rest = new REST({ version: '10' }).setToken(DISCORD_TOKEN);

(async () => {
    try {
        console.log('Started refreshing application (/) commands.');

        await rest.put(
            // Routes.applicationGuildCommands(DISCORD_CLIENT_ID, GUILD_ID), // Pour les commandes de guilde
            Routes.applicationCommands(DISCORD_CLIENT_ID), // Pour les commandes globales, décommentez cette ligne et commentez la ligne précédente pour des commandes globales
            { body: commands },
        );

        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error(error);
    }
})();
