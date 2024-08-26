const lfgHandler = require('../handlers/lfgHandler');
const lfgverseHandler = require('../handlers/lfgverseHandler');

module.exports = {
    name: 'interactionCreate',
    async execute(interaction, client) {
        if (interaction.isCommand()) {
            const command = client.commands.get(interaction.commandName);
            if (command) {
                await command.execute(interaction);
            }
        } else if (interaction.isModalSubmit()) {
            await lfgHandler.handleModalInteraction(interaction);
        } else if (interaction.isButton()) {
            await lfgHandler.handleButtonInteraction(interaction);
        } else if (interaction.isStringSelectMenu()) {
            await lfgverseHandler.handleSelectMenuInteraction(interaction);
        }
    }
};
