const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
function createProgressBar(score) {
    const totalEmojis = 10;
    const filledEmojiCount = Math.round((score / 100) * totalEmojis);
    const emptyEmojiCount = totalEmojis - filledEmojiCount;
    return ':green_square:'.repeat(filledEmojiCount) + ':black_large_square:'.repeat(emptyEmojiCount);
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('rank')
        .setDescription('Affiche le score d\'un utilisateur.')
        .addUserOption(option => option.setName('utilisateur').setDescription('L\'utilisateur à afficher.').setRequired(false)),
    async execute(interaction) {
        const user = interaction.options.getUser('utilisateur') || interaction.user;

        client.database.query(
            'SELECT Score FROM rank WHERE UserId = ?',
            [user.id],
            (err, results) => {
                if (err) {
                    console.error(err);
                    return interaction.reply({ content: 'Erreur lors de la récupération du score.', ephemeral: true });
                }

                const score = results.length ? results[0].Score : 0;
                const progressBar = createProgressBar(score);

                const embed = new EmbedBuilder()
                    .setTitle(`Score de ${user.username} avant le prochain RankUp`)
                    .setDescription(`${progressBar} (${score}%)`)
                    .setColor('#0099ff');

                interaction.reply({ embeds: [embed] });
            }
        );
    },
};
