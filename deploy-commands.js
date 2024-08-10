const { REST, Routes } = require('discord.js');
const { botConfig } = require('./src/config/botConfig');
const fs = require('fs');
const path = require('path');

const commands = [];

// Fonction pour lire les fichiers de manière récursive
const readCommands = (dir) => {
    const files = fs.readdirSync(dir);

    for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            // Si c'est un répertoire, on appelle récursivement la fonction
            readCommands(filePath);
        } else if (file.endsWith('.js')) {
            // Si c'est un fichier .js, on le charge
            const command = require(filePath);
            commands.push(command.data.toJSON());
        }
    }
};

// Lancer la lecture des commandes à partir du répertoire 'commands'
readCommands('./src/commands/');

const rest = new REST({ version: '10' }).setToken(botConfig.token);

(async () => {
    try {
        console.log('Started refreshing application (/) commands.');

        await rest.put(
            Routes.applicationGuildCommands(botConfig.client),
            { body: commands },
        );

        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error(error);
    }
})();
