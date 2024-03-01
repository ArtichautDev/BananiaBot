const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
// Fonction pour convertir des minutes en un format plus lisible
function convertMinutes(minutes) {
    const months = Math.floor(minutes / 43200); // 43200 = 60 * 24 * 30
    const days = Math.floor((minutes % 43200) / 1440); // 1440 = 60 * 24
    const hours = Math.floor((minutes % 1440) / 60);
    const mins = minutes % 60;
  
    let result = '';
    if (months > 0) result += `${months} mois `;
    if (days > 0) result += `${days} jours `;
    if (hours > 0) result += `${hours} h `;
    if (mins > 0) result += `${mins} min`;
    if (result === '') result = '0 min';
  
    return result.trim();
}

// Exemple d'intégration dans la commande /voicetop
module.exports = {
    data: new SlashCommandBuilder()
        .setName('voicetop')
        .setDescription('Affiche le classement du temps passé en vocal'),
    async execute(interaction) {
        try {
            await interaction.deferReply();
            client.database.query('SELECT UserId, Minutes FROM voice ORDER BY Minutes DESC LIMIT 15', async (error, results) => {
                if (error) throw error;
                
                let rankingDescription = 'Top 15 des utilisateurs par temps passé en vocal:\n';
                
                results.forEach((user, index) => {
                    rankingDescription += `#${index + 1} - <@${user.UserId}> avec ${convertMinutes(user.Minutes)}\n`;
                });

                const embed = new EmbedBuilder()
                    .setColor('#0099ff')
                    .setTitle('Classement Vocal')
                    .setDescription(rankingDescription)
                    .setTimestamp()
                    .setFooter({ text: 'Classement vocal' });

                // Recherche du rang de l'utilisateur exécutant la commande
                const userId = interaction.user.id;
                client.database.query('SELECT UserId, Minutes, FIND_IN_SET( Minutes, (SELECT GROUP_CONCAT( Minutes ORDER BY Minutes DESC ) FROM voice )) AS rank FROM voice WHERE UserId = ?', [userId], (error, result) => {
                    if (error) throw error;
                    if (result.length > 0) {
                        const userRank = result[0].rank;
                        embed.setDescription(embed.data.description + `\nVotre Rang: Vous êtes #${userRank} avec ${convertMinutes(result[0].Minutes)}`);
                    } else {
                        embed.setDescription(embed.data.description + `\nVotre Rang: Vous n'êtes pas dans le classement.`);
                    }

                    interaction.editReply({ embeds: [embed] });
                });
            });
        } catch (e) {
            console.error(e);
            await interaction.followUp({ content: 'Il y a eu une erreur lors de l’exécution de la commande.', ephemeral: true });
        }
    },
};
