const {startReminderService} = require('../utils/reminderScheduler');

module.exports = {
    name: 'ready',
    once: true,
    execute(client) {
        console.log(`Logged in as ${client.user.tag}!`);
        try {
            startReminderService(client); // Appel de la fonction pour démarrer le service de rappels
            console.log('Service de rappels démarré avec succès!');
        } catch (error) {
            console.error('Erreur lors du démarrage du service de rappels:', error);
        }
    },
};
