const { SlashCommandBuilder, EmbedBuilder, AttachmentBuilder, UserFlagsBitField } = require('discord.js');
const ServerCollection = require('../../models/serverConfig');
const Canvas = require('canvas');
const sharp = require('sharp');
const fetch = require('node-fetch');
const path = require('path');

Canvas.registerFont(path.join(__dirname, '../../fonts/Satoshi-Black.ttf'), { family: 'Satoshi', weight: '900' });
Canvas.registerFont(path.join(__dirname, '../../fonts/Satoshi-BlackItalic.ttf'), { family: 'Satoshi', weight: '900', style: 'italic' });
Canvas.registerFont(path.join(__dirname, '../../fonts/Satoshi-Bold.ttf'), { family: 'Satoshi', weight: 'bold' });
Canvas.registerFont(path.join(__dirname, '../../fonts/Satoshi-BoldItalic.ttf'), { family: 'Satoshi', weight: 'bold', style: 'italic' });
Canvas.registerFont(path.join(__dirname, '../../fonts/Satoshi-Italic.ttf'), { family: 'Satoshi', style: 'italic' });
Canvas.registerFont(path.join(__dirname, '../../fonts/Satoshi-Light.ttf'), { family: 'Satoshi', weight: '300' });
Canvas.registerFont(path.join(__dirname, '../../fonts/Satoshi-LightItalic.ttf'), { family: 'Satoshi', weight: '300', style: 'italic' });
Canvas.registerFont(path.join(__dirname, '../../fonts/Satoshi-Medium.ttf'), { family: 'Satoshi', weight: '500' });
Canvas.registerFont(path.join(__dirname, '../../fonts/Satoshi-MediumItalic.ttf'), { family: 'Satoshi', weight: '500', style: 'italic' });
Canvas.registerFont(path.join(__dirname, '../../fonts/Satoshi-Regular.ttf'), { family: 'Satoshi', weight: 'normal' });

module.exports = {
    data: new SlashCommandBuilder()
        .setName('information')
        .setDescription('Affiche une image avec les informations d\'un utilisateur ou du serveur.')
        .addUserOption(option =>
            option.setName('utilisateur')
                .setDescription('Mentionnez un utilisateur pour voir ses informations')
                .setRequired(false))
        .addBooleanOption(option =>
            option.setName('serveur')
                .setDescription('Afficher les informations du serveur.')
                .setRequired(false)),
    async execute(interaction) {

        const serverConfig = await ServerCollection.findOne({ serverId: interaction.guild.id });
        let color = serverConfig ? serverConfig.color : '#7C30B8';

        const showServerInfo = interaction.options.getBoolean('serveur') || false;
        const user = interaction.options.getUser('utilisateur') || interaction.user;
        const member = await interaction.guild.members.fetch(user.id).catch(() => null);

        const backgroundPath = showServerInfo
            ? path.join(__dirname, '../../img/background/informationServer_template.png')
            : path.join(__dirname, '../../img/background/informationUser_template.png');


        const serverData = await ServerCollection.findOne({ serverId: interaction.guild.id });
        let messageCount = 0;
        if (serverData && serverData.stats) {
            const userStats = serverData.stats.get(user.id);
            if (userStats) {
                messageCount = userStats.messageCount || 0;
            }
        }

        function truncateText(context, text) {
            const maxWidth = 380;
            let width = context.measureText(text).width;
            const ellipsis = '...';
            const ellipsisWidth = context.measureText(ellipsis).width;

            if (width <= maxWidth) {
                return text;
            }

            while (width >= maxWidth - ellipsisWidth) {
                text = text.slice(0, -1);
                width = context.measureText(text).width;
            }

            return text + ellipsis;
        }
        function formatDate(date) {
            const options = { day: '2-digit', month: 'long', year: 'numeric' };
            return new Intl.DateTimeFormat('fr-FR', options).format(date);
        }

        const margin = 20;
        const canvasWidth = 820 + margin * 2;
        const canvasHeight = 700 + margin * 2;

        const canvas = Canvas.createCanvas(canvasWidth, canvasHeight);
        const context = canvas.getContext('2d');
        const background = await Canvas.loadImage(backgroundPath);
        context.drawImage(background, 0, 0, canvasWidth, canvasHeight);

        if (showServerInfo) {
     
            const response = await fetch(interaction.guild.iconURL({ format: 'png', dynamic: true, size: 1024 }));
            const buffer = await response.buffer();

            const pngBuffer = await sharp(buffer).png().toBuffer();
            const img = await Canvas.loadImage(pngBuffer);

            const avatarX = margin;
            const avatarY = margin;
            const avatarWidth = 270;
            const avatarHeight = 270;
            const Radius = 35;

            const infoX = margin + 20;
            let infoY = 365;
            const lineHeight = 108;

            context.save();
            context.beginPath();
            context.moveTo(avatarX + Radius, avatarY);
            context.lineTo(avatarX + avatarWidth - Radius, avatarY);
            context.quadraticCurveTo(avatarX + avatarWidth, avatarY, avatarX + avatarWidth, avatarY + Radius);
            context.lineTo(avatarX + avatarWidth, avatarY + avatarHeight - Radius);
            context.quadraticCurveTo(avatarX + avatarWidth, avatarY + avatarHeight, avatarX + avatarWidth - Radius, avatarY + avatarHeight);
            context.lineTo(avatarX + Radius, avatarY + avatarHeight);
            context.quadraticCurveTo(avatarX, avatarY + avatarHeight, avatarX, avatarY + avatarHeight - Radius);
            context.lineTo(avatarX, avatarY + Radius);
            context.quadraticCurveTo(avatarX, avatarY, avatarX + Radius, avatarY);
            context.closePath();
            context.lineWidth = 1;
            context.strokeStyle = 'rgba(255, 255, 255, 0.2)';
            context.stroke();
            context.clip();
            context.drawImage(img, avatarX, avatarY, avatarWidth, avatarHeight);
            context.restore();

            const nameX = avatarX + avatarWidth + 50;
            const nameY = avatarY + 40;
            context.font = 'bold 24px Satoshi';
            context.fillStyle = '#ffffff';
            const truncatedUsername = truncateText(context, interaction.guild.name.toUpperCase(), canvasWidth - nameX - margin);
            context.fillText(truncatedUsername, nameX, nameY);


            context.font = 'bold 28px Satoshi';
            context.fillStyle = '#ffffff';
            const creationDate = `Créé le: ${formatDate(interaction.guild.createdAt)}`;
            const memberCount = `Nombre de membres: ${interaction.guild.memberCount}`;
            const userId = `ID: ${interaction.guild.id}`;

            context.fillText(creationDate, infoX, infoY);
            infoY += lineHeight;
            context.fillText(memberCount, infoX, infoY);
            infoY += lineHeight;
            context.fillText(userId, infoX, infoY);
            const nicknameY = nameY + 80;
            const badgesX = nameX - 22;
            const badgesY = nicknameY + 48;
            const badgeSize = 30;
            const badgeSpacing = 35;
            if (interaction.guild.features.includes('COMMUNITY')) {
                const communityBadgePath = path.join(__dirname, '../../img/badges/CommunityBoosted.svg');
                const communityBadgeBuffer = await sharp(communityBadgePath).png().toBuffer();
                const communityBadgeImg = await Canvas.loadImage(communityBadgeBuffer);
                // context.drawImage(communityBadgeImg, badgesX, badgesY, badgeSize, badgeSize); // Ajustez la taille comme nécessaire
            }

        } else {
            const avatarUrl = user.displayAvatarURL({ format: 'png', dynamic: true, size: 1024 });
            const response = await fetch(avatarUrl);
            const buffer = await response.buffer();

            const pngBuffer = await sharp(buffer).png().toBuffer();
            const img = await Canvas.loadImage(pngBuffer);

            const nameX = avatarX + avatarWidth + 50;
            const nameY = avatarY + 40;
            const nicknameY = nameY + 80;
            const avatarX = margin;
            const avatarY = margin;
            const avatarWidth = 270;
            const avatarHeight = 270;
            const Radius = 10;

            const badgesX = nameX - 22;
            const badgesY = nicknameY + 48;
            const badgeSize = 30;
            const badgeSpacing = 35;

            const infoX = margin + 20;
            let infoY = 365;
            const lineHeight = 108;

            context.save();
            context.beginPath();
            context.moveTo(avatarX + Radius, avatarY);
            context.lineTo(avatarX + avatarWidth - Radius, avatarY);
            context.quadraticCurveTo(avatarX + avatarWidth, avatarY, avatarX + avatarWidth, avatarY + Radius);
            context.lineTo(avatarX + avatarWidth, avatarY + avatarHeight - Radius);
            context.quadraticCurveTo(avatarX + avatarWidth, avatarY + avatarHeight, avatarX + avatarWidth - Radius, avatarY + avatarHeight);
            context.lineTo(avatarX + Radius, avatarY + avatarHeight);
            context.quadraticCurveTo(avatarX, avatarY + avatarHeight, avatarX, avatarY + avatarHeight - Radius);
            context.lineTo(avatarX, avatarY + Radius);
            context.quadraticCurveTo(avatarX, avatarY, avatarX + Radius, avatarY);
            context.closePath();
            context.lineWidth = 1;
            context.strokeStyle = 'rgba(255, 255, 255, 0.2)';
            context.stroke();
            context.clip();
            context.drawImage(img, avatarX, avatarY, avatarWidth, avatarHeight);
            context.restore();

            context.font = 'bold 24px Satoshi';
            context.fillStyle = '#ffffff';
            const truncatedUsername = truncateText(context, user.username.toUpperCase(), canvasWidth - nameX - margin);
            context.fillText(truncatedUsername, nameX, nameY);

           
            context.font = 'italic 500 24px Satoshi';
            context.fillStyle = '#ffffff';
            const truncatedNickname = truncateText(context, (member.nickname || '').toUpperCase(), canvasWidth - nameX - margin);
            context.fillText(truncatedNickname, nameX, nicknameY);

            const userFlags = user.flags?.toArray() || [];
            console.log(userFlags);
            const badgeMap = {
                'Staff': 'discord_employee.svg',
                'Partner': 'partnered_server_owner.svg',
                'Hypesquad': 'hypesquad_events.svg',
                'BugHunterLevel1': 'bughunter_level_1.svg',
                'BugHunterLevel2': 'bughunter_level_2.svg',
                'PremiumEarlySupporter': 'early_supporter.svg',
                'VerifiedBot': 'verified_bot.svg',
                'VerifiedDeveloper': 'early_verified_bot_developer.svg',
                'CertifiedModerator': 'discord_certified_moderator.svg',
                'ActiveDeveloper': 'active_developer.svg',
                'HypeSquadOnlineHouse1': 'house_bravery.svg',
                'HypeSquadOnlineHouse2': 'house_brilliance.svg',
                'HypeSquadOnlineHouse3': 'house_balance.svg',
                'TeamPseudoUser': 'username.png',
                'Nitro': 'discord_nitro.svg',
            };
            if (member.premiumSince) {
                userFlags.push('Nitro');
            }
            if (member.TeamPseudoUser) {
                userFlags.push('TeamPseudoUser');
            }


            for (const [index, flag] of userFlags.entries()) {
                const badgeFileName = badgeMap[flag];
                if (badgeFileName) {
                    const badgePath = path.join(__dirname, `../../img/badges/${badgeFileName}`);
                    const badgeBuffer = await sharp(badgePath).png().toBuffer();
                    const badgeImg = await Canvas.loadImage(badgeBuffer);
                    context.drawImage(badgeImg, badgesX + (badgeSize + badgeSpacing) * index, badgesY, badgeSize, badgeSize);
                }
            }



            context.font = 'bold 28px Satoshi';
            context.fillStyle = '#ffffff';

            const creationDate = `Créé le: ${formatDate(user.createdAt)}`;
            const joinDate = member.joinedAt ? `Rejoint le: ${formatDate(member.joinedAt)}` : 'Rejoint le: Inconnu';
            const messageCountText = `Nombre de messages: ${messageCount}` || 'Non disponible';
            const userId = `ID: ${user.id}`;
            context.fillText(creationDate, infoX, infoY);
            infoY += lineHeight;
            context.fillText(joinDate, infoX, infoY);
            infoY += lineHeight;
            context.fillText(messageCountText, infoX, infoY);
            infoY += lineHeight;
            context.fillText(userId, infoX, infoY);

        }



        try {


            const bandeauPath = path.join(__dirname, '../../img/icons/bandeau_beta.png');
            const bandeauBuffer = await sharp(bandeauPath).png().toBuffer();
            const bandeauImg = await Canvas.loadImage(bandeauBuffer);
            const bandeauX = canvasWidth - 113;
            const bandeauY = canvasHeight - 113;
            context.drawImage(bandeauImg, bandeauX, bandeauY, 113, 113);

            const attachment = new AttachmentBuilder(canvas.toBuffer(), { name: 'information.png' });
            const embed = new EmbedBuilder()
                .setColor(color)
                .setTitle(`Informations sur ${user.username}`)
                .setImage('attachment://information.png')
                .setTimestamp();
            await interaction.reply({ embeds: [embed], files: [attachment] });
        } catch (error) {
            console.error('Erreur lors du traitement de l\'image:', error);
            await interaction.reply({ content: 'Une erreur s\'est produite lors de la génération de l\'image.', ephemeral: true });
        }
    },
};
