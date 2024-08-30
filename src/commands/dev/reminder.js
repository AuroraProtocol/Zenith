const { SlashCommandBuilder } = require('discord.js');
const { sendReminders } = require('../../utils/reminderScheduler'); // Importez la fonction sendReminders

// Remplacez 'YOUR_USER_ID' par votre véritable ID Discord
const ALLOWED_USER_ID = '255422500446535680';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('testreminder')
        .setDescription('Force l\'envoi des rappels pour tester'),
    async execute(interaction, client) {
        if (interaction.user.id !== ALLOWED_USER_ID) {
            return interaction.reply({ content: 'Vous n\'avez pas l\'autorisation d\'exécuter cette commande.', ephemeral: true });
        }

        try {
            await sendReminders(client); // Appelez la fonction sendReminders
            await interaction.reply('Les rappels ont été envoyés avec succès.');
        } catch (error) {
            console.error('Erreur lors de l\'envoi des rappels de test:', error);
            await interaction.reply('Une erreur est survenue lors de l\'envoi des rappels.');
        }
    },
};
