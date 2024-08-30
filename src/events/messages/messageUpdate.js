const ServerCollection = require('../../models/serverConfig');

module.exports = {
    name: 'messageUpdate',
    async execute(oldMessage, newMessage) {
        if (!newMessage.author || newMessage.author.bot) return;
        if (!newMessage.guild) return;

        const idServer = newMessage.guild.id;
        const idUser = newMessage.author.id;

        try {
            let server = await ServerCollection.findOne({ serverId: idServer });

            if (server) {
                let userStats = server.stats.get(idUser) || {
                    messageCount: 0,
                    messageEdit: 0,
                    messageDelete: 0,
                    imageUpload: 0,
                    reactionAdd: 0,
                    reactionRemove: 0
                };
                userStats.messageEdit += 1;
                server.stats.set(idUser, userStats);
                await server.save();
            }
        } catch (error) {
            console.error('Error updating user stats:', error);
        }
    }
};
