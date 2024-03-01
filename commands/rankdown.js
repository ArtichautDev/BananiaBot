const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');


module.exports = {
    data: new SlashCommandBuilder()
        .setName('rankdown')
        .setDescription('Diminue le score d\'un utilisateur.')
        .addUserOption(option => option.setName('utilisateur').setDescription('L\'utilisateur à rank down.').setRequired(true))
        .addIntegerOption(option => option.setName('pourcentage').setDescription('Le pourcentage à retirer.').setRequired(true)),
    async execute(interaction) {

        const user = interaction.options.getUser('utilisateur');
        const pourcentage = interaction.options.getInteger('pourcentage');

        // Vérification et mise à jour du score dans la base de données
        client.database.query(
            'SELECT Score FROM `rank` WHERE UserId = ?',
            [user.id],
            (err, results) => {
                if (err) {
                    console.error(err);
                    return interaction.reply({ content: 'Erreur lors de la récupération du score.', ephemeral: true });
                }

                if (results.length === 0) {
                    // Si l'utilisateur n'existe pas dans la base, insérer avec un score initial de 0 (ou un score négatif si on le souhaite)
                    return interaction.reply({ content: `L'utilisateur <@${user.id}> n'a pas de score enregistré pour être diminué.`, ephemeral: true });
                }

                let newScore = results[0].Score - pourcentage;
                if (newScore < 0) newScore = 0; // Assure que le score ne devienne pas négatif

                // Mise à jour du score de l'utilisateur
                client.database.query(
                    'UPDATE `rank` SET Score = ? WHERE UserId = ?',
                    [newScore, user.id],
                    (err) => {
                        if (err) {
                            console.error(err);
                            return interaction.reply({ content: 'Erreur lors de la mise à jour du score.', ephemeral: true });
                        }
                        interaction.reply({ content: `Le score de <@${user.id}> a été diminué à ${newScore}%.`, ephemeral: false });
                    }
                );
            }
        );
    },
};
