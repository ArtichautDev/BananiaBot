const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const voteCooldowns = {};
module.exports = {
    data: new SlashCommandBuilder()
        .setName('vote')
        .setDescription('Vote pour mettre en muet un membre dans le canal vocal.')
        .addUserOption(option => 
            option.setName('utilisateur')
            .setDescription('L\'utilisateur à mettre en muet.')
            .setRequired(true)),
    async execute(interaction) {
        const targetUser = interaction.options.getUser('utilisateur');
        const now = Date.now();
        const cooldownAmount = 7 * 60 * 1000; // 7 minutes en millisecondes

        // Vérifie si un vote récent a été lancé pour cet utilisateur
        if (voteCooldowns[targetUser.id] && voteCooldowns[targetUser.id] + cooldownAmount > now) {
            const timeLeft = (voteCooldowns[targetUser.id] + cooldownAmount - now) / 60000; // Convertit en minutes
            return interaction.reply({ content: `Vous devez attendre encore ${timeLeft.toFixed(1)} minutes avant de pouvoir lancer un nouveau vote sur cet utilisateur.`, ephemeral: true });
        }

        // Mettre à jour le cooldown pour cet utilisateur
        voteCooldowns[targetUser.id] = now;

        const member = await interaction.guild.members.fetch(interaction.user.id);
        const targetMember = await interaction.guild.members.fetch(targetUser.id);
        if (!member.voice.channelId || member.voice.channelId !== targetMember.voice.channelId) {
            return interaction.reply({ content: 'Vous devez être dans le même canal vocal que l\'utilisateur cible pour utiliser cette commande.', ephemeral: true });
        }

        const channel = member.voice.channel;
        const members = channel.members.filter(m => !m.user.bot);

        // Mentionner les membres concernés dans un message séparé
        const mentions = members.map(m => m.toString()).join(' ');
        await interaction.reply({ content: `Vote pour mettre en muet ${targetUser.username} : ${mentions}` });

        // Création de l'embed de vote
        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('Vote de Mute Vocal (Special Bmolloc)')
            .setDescription(`Votez pour mettre en muet ${targetUser.username} pendant 3 minutes.`)
            .setFooter({ text: 'Le vote dure 45 secondes ou jusqu\'à ce que tous votent. La majorité l\'emporte.' });

        // Création des boutons de vote
        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('vote_mute_yes')
                    .setLabel('Oui')
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setCustomId('vote_mute_no')
                    .setLabel('Non')
                    .setStyle(ButtonStyle.Danger),
            );

        const message = await interaction.followUp({ embeds: [embed], components: [row], fetchReply: true });

        const collector = message.createMessageComponentCollector({ time: 45000 });
        const votes = { yes: 0, no: 0, voters: new Set() };

        collector.on('collect', async i => {
            if (!votes.voters.has(i.user.id)) {
                votes.voters.add(i.user.id);
                votes[i.customId === 'vote_mute_yes' ? 'yes' : 'no']++;
                await i.reply({ content: `Vote enregistré: ${i.customId === 'vote_mute_yes' ? 'Oui' : 'Non'}.`, ephemeral: true });
                
                // Vérifie si tous les membres ont voté
                if (votes.voters.size >= members.size) {
                    collector.stop('all_voted');
                }
            } else {
                await i.reply({ content: `Vous avez déjà voté.`, ephemeral: true });
            }
        });

        collector.on('end', async (collected, reason) => {
            let resultEmbed = new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle('Résultat du Vote de Mute Vocal')
                .setDescription(`Résultats du vote pour mettre en muet ${targetUser.username}:\n\nOui: ${votes.yes}\nNon: ${votes.no}`);
        
            let components = []; // Initialise un tableau vide pour les composants
        
            if (votes.yes > votes.no) {
                resultEmbed.addFields({ name: 'Résultat', value: `${targetUser.username} sera mis en muet pendant 3 minutes.` });
                targetMember.voice.setMute(true, 'Résultat du vote de mute vocal');
        
                // Crée un bouton pour le vote de demute
                const demuteRow = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('vote_demute')
                            .setLabel('Retirer Mute')
                            .setStyle(ButtonStyle.Secondary),
                    );
        
                components.push(demuteRow);
        
                setTimeout(() => {
                    if (targetMember.voice.serverMute) {
                        targetMember.voice.setMute(false, 'Fin du mute vocal par vote');
                        // Mettre à jour le message pour indiquer que le mute a expiré
                        interaction.followUp({ content: `${targetUser.username} n'est plus en muet après le délai de mute.`, components: [] });
                    }
                }, 180000); // 3 minutes
            } else {
                resultEmbed.addFields({ name: 'Résultat', value: `Pas de mute pour ${targetUser.username}.` });
            }
        
            await interaction.followUp({ embeds: [resultEmbed], components });
        
            if (votes.yes > votes.no) {
                // Collecteur pour le bouton de demute
                const filter = i => i.customId === 'vote_demute';
                const buttonCollector = interaction.channel.createMessageComponentCollector({ filter, max: 1, time: 60000 }); // 60 secondes pour voter
        
                buttonCollector.on('collect', async i => {
                    // Prépare l'embed et les boutons pour le vote de demute
                    const voteDemuteEmbed = new EmbedBuilder()
                        .setColor('#0099ff')
                        .setTitle('Vote pour retirer le Mute Vocal')
                        .setDescription(`Votez pour retirer le mute de ${targetUser.username}.`);
                
                    const voteRow = new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId('demute_yes')
                                .setLabel('Oui')
                                .setStyle(ButtonStyle.Success),
                            new ButtonBuilder()
                                .setCustomId('demute_no')
                                .setLabel('Non')
                                .setStyle(ButtonStyle.Danger),
                        );
                
                    // Mettre à jour le message avec l'embed et les boutons pour le vote de demute
                    await i.update({ content: 'Un nouveau vote a été lancé pour décider de retirer le mute.', embeds: [voteDemuteEmbed], components: [voteRow] });
                
                    // Collecteur pour le vote de demute
                    const demuteFilter = (interaction) => interaction.customId === 'demute_yes' || interaction.customId === 'demute_no';
                    const demuteCollector = i.message.createMessageComponentCollector({ filter: demuteFilter, time: 45000 }); // Durée du vote de 45 secondes
                
                    let votesYes = 0;
                    let votesNo = 0;
                
                    demuteCollector.on('collect', async vote => {
                        if (vote.customId === 'demute_yes') {
                            votesYes++;
                        } else {
                            votesNo++;
                        }
                        await vote.deferUpdate();
                    });
                
                    demuteCollector.on('end', async collected => {
                        // Vérifiez si la majorité a voté pour le demute
                        if (votesYes > votesNo) {
                            targetMember.voice.setMute(false, 'Mute retiré suite au vote de demute');
                            await i.followUp({ content: `${targetUser.username} n'est plus en muet suite au vote.`, embeds: [], components: [] });
                        } else {
                            await i.followUp({ content: `Le vote pour retirer le mute de ${targetUser.username} n'a pas atteint la majorité. ${targetUser.username} reste en muet.`, embeds: [], components: [] });
                        }
                    });
                });
                
            }
        });
        
    },
};