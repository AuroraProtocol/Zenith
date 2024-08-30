const ServerCollection = require('../../models/serverConfig'); // Adjust path as necessary

module.exports = {
    name: 'messageCreate',
    async execute(client, message) {
        if (!message.author || message.author.bot) return;
        if (!message.guild) return;

        const idServer = message.guild.id;
        const idUser = message.author.id;

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
                userStats.messageCount += 1;
                server.stats.set(idUser, userStats);
                await server.save();
            } else {
                const newServer = new ServerCollection({
                    serverId: idServer,
                    stats: {
                        [idUser]: {
                            messageCount: 1,
                            messageEdit: 0,
                            messageDelete: 0,
                            imageUpload: 0,
                            reactionAdd: 0,
                            reactionRemove: 0
                        }
                    }
                });
                await newServer.save();
            }
        } catch (error) {
            console.error('Error updating user stats:', error);
        }
    }
};
