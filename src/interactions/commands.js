module.exports = async (interaction, client) => {
    const command = client.commands.get(interaction.commandName);
    if (command) {
        await command.execute(interaction);
    }
};
