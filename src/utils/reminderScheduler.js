
const { EmbedBuilder, ChannelType } = require('discord.js');
const Event = require('../models/eventModel');

async function sendReminders(client) {
    function formatDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    }

    const now = new Date();
    const fifteenMinutesLater = new Date(now.getTime() + 15 * 60 * 1000);
    const thirtyMinutesAgo = new Date(now.getTime() - 30 * 60 * 1000);
    console.log('Checking for events between:', formatDate(now), 'and', formatDate(fifteenMinutesLater));

    let events;
    try {
        events = await Event.find({
            date: { $lte: fifteenMinutesLater, $gte: now },
            reminderSent: false
        });
    } catch (error) {
        console.error('Erreur lors de la récupération des événements:', error);
        return;
    }

    console.log('Events found:', events.map(event => ({
        name: event.name,
        date: formatDate(event.date),
        serverId: event.serverId,
        participants: event.participants
    })));

    for (const event of events) {
        if (!client || !client.users) {
            console.error('Client ou client.users est indéfini.');
            continue;
        }

        const guild = client.guilds.cache.get(event.serverId);
        if (!guild) {
            console.error('Serveur non trouvé.');
            continue;
        }
        let participants, verseParticipants;
        try {
            participants = await Promise.all(event.participants.map(userId => client.users.fetch(userId)));
            verseParticipants = await Promise.all(event.verseParticipants.map(userId => client.users.fetch(userId)));
        } catch (error) {
            console.error('Erreur lors de la récupération des participants:', error);
            continue;
        }

        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle(`Rappel : ${event.name}`)
            .setDescription(`L'événement commence dans moins de 15 minutes!`)
            .addFields(
                { name: 'Participants', value: participants.map(user => `<@${user.id}>`).join(', ') },
                { name: 'Heure de début', value: `<t:${Math.floor(event.date.getTime() / 1000)}:f>` }
            )
            .setTimestamp()
            .setFooter({ text: 'Rappel automatique' });

        let protocolCategory = guild.channels.cache.find(ch => ch.name === 'Protocol Zenith' && ch.type === ChannelType.GuildCategory);
        if (!protocolCategory) {
            protocolCategory = await guild.channels.create({
                name: 'Protocol Zenith',
                type: ChannelType.GuildCategory
            });
        }

        let rappelChannel = guild.channels.cache.find(
            ch => ch.name === 'rappels' && ch.parentId === protocolCategory.id && ch.type === ChannelType.GuildText
        );
        if (!rappelChannel) {
            rappelChannel = await guild.channels.create({
                name: 'rappels',
                type: ChannelType.GuildText,
                parent: protocolCategory.id
            });
        }

        await sendReminderToParticipants(participants, rappelChannel, embed, event);
        if (event.sharedServers && event.sharedServers.length > 0) {
            const invite = await guild.invites.create(rappelChannel, { maxUses: 1, unique: true, temporary: true, reason: 'Pour participer à l\'événement' });
            const timestamp = Math.floor(event.date.getTime() / 1000);
            const verseEmbed = new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle(`Rappel : ${event.name}`)
                .setDescription(`L'événement commence dans moins de 15 minutes ! Rejoignez le serveur d'origine pour participer.`)
                .addFields(
                    { name: 'Participants Origine', value: participants.map(user => `<@${user.id}>`).join(', ') },
                    { name: 'Participants Verse', value: verseParticipants.map(user => `<@${user.id}>`).join(', ') },
                    { name: 'Heure de début', value: `<t:${timestamp}:f> - <t:${timestamp}:R>` },
                    { name: 'Invitation au serveur', value: invite.url }
                )
                .setTimestamp()
                .setFooter({ text: 'Rappel automatique' });

            await sendReminderToParticipants(verseParticipants, rappelChannel, verseEmbed, event);
        }

        event.reminderSent = true;
        try {
            await event.save();
            console.log(`L'événement "${event.name}" a été mis à jour avec reminderSent: true`);
        } catch (error) {
            console.error(`Erreur lors de la mise à jour de l'événement "${event.name}":`, error);
        }
    }
    let expiredEvents;
    try {
        expiredEvents = await Event.find({
            date: { $lt: thirtyMinutesAgo },
            reminderSent: true
        });
    } catch (error) {
        console.error('Erreur lors de la récupération des événements expirés:', error);
        return;
    }
    console.log('Events expired:', expiredEvents.map(event => ({
        name: event.name,
        date: formatDate(event.date),
        serverId: event.serverId,
        participants: event.participants
    })));

    for (const expiredEvent of expiredEvents) {
        const messageId = expiredEvent.messageId;

        if (messageId) {
            try {

                const message = await client.channels.cache.map(async (channel) => {
                    try {
                        const fetchedMessage = await channel.messages.fetch(messageId);
                        if (fetchedMessage) {
                            await fetchedMessage.delete();
                            console.log(`Message supprimé pour l'événement "${expiredEvent.name}"`);
                        }
                    } catch (error) {
                    }
                });
            } catch (error) {
                console.error(`Erreur lors de la suppression du message pour l'événement "${expiredEvent.name}":`, error);
            }
        }
        try {
            await Event.deleteOne({ eventId: expiredEvent.eventId });
            console.log(`L'événement "${expiredEvent.name}" a été supprimé après expiration.`);
        } catch (error) {
            console.error(`Erreur lors de la suppression de l'événement "${expiredEvent.name}":`, error);
        }
    }
}
async function sendReminderToParticipants(participants, rappelChannel, embed, event) {
    const messageIds = [];

    for (const user of participants) {
        if (user) {
            try {
                const dmMessage = await user.send({ embeds: [embed] });
                messageIds.push(dmMessage.id);
                console.log(`Rappel envoyé à ${user.username} (${user.id})`);
            } catch (error) {
                if (error.code === 50007) {
                    console.log(`Impossible d'envoyer un MP à ${user.username} (${user.id}), envoi dans le canal.`);
                    if (rappelChannel) {
                        try {
                            const channelMessage = await rappelChannel.send({
                                content: `🔔 <@${user.id}> L'événement **${event.name}** commence dans moins de 15 minutes!`,
                                embeds: [embed],
                            });
                            messageIds.push(channelMessage.id);
                            console.log(`Rappel envoyé à ${user.username} (${user.id}) sur le serveur`);
                        } catch (channelError) {
                            console.error(`Erreur lors de l'envoi d'un rappel sur le serveur pour l'utilisateur ${user.id}:`, channelError);
                        }
                    }
                } else {
                    console.error(`Erreur inattendue lors de l'envoi d'un rappel à l'utilisateur ${user.id}:`, error);
                }
            }
        }
    }
    return messageIds;
}

function startReminderService(client) {
    setInterval(() => {
        console.log('-----------------Vérif des rappels à:', new Date().toLocaleString());
        sendReminders(client);
    }, 60 * 1000); // chaque minute
}

module.exports = { startReminderService, sendReminders };
