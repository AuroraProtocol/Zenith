const { Activity, ActivityType, Emoji } = require('discord.js');
const { startReminderService } = require('../utils/reminderScheduler');

module.exports = {
    name: 'ready',
    once: true,
    async execute(client) {
        console.log(`Logged in as ${client.user.tag}!`);
        // client.user.setActivity({
        //     name: 'Zenith',
        //     type: ActivityType.Custom,
        //     Emoji: ":smiley:",
        //     state: '✍️ En attente de commandes...',
        //     // url: '',
        // });
        const status = await client.user.setPresence({
            status: 'dnd',
            activities: [{
                state: 'En attente de commandes...',
                name: `${client.user.username}`,
                type: ActivityType.Streaming,
                emoji: "💫",
                url: 'https://www.twitch.tv/protocolzenith',

            }],
        })
        // console.log(status);
        try {
            startReminderService(client); // Appel de la fonction pour démarrer le service de rappels
            console.log('Service de rappels démarré avec succès!');
        } catch (error) {
            console.error('Erreur lors du démarrage du service de rappels:', error);
        }
    },
};
