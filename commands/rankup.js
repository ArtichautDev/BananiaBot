const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');


module.exports = {
    data: new SlashCommandBuilder()
        .setName('rankup')
        .setDescription('Augmente le score d\'un utilisateur.')
        .addUserOption(option => option.setName('utilisateur').setDescription('L\'utilisateur à rank up.').setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
        .addIntegerOption(option => option.setName('pourcentage').setDescription('Le pourcentage à ajouter.').setRequired(true)),
    async execute(interaction) {

        const user = interaction.options.getUser('utilisateur');
        const pourcentage = interaction.options.getInteger('pourcentage');
        
    client.database.query(
            'SELECT Score FROM `rank` WHERE UserId = ?',
            [user.id],
            (err, results) => {
                if (err) {
                    console.error(err);
                    return interaction.reply({ content: 'Erreur lors de la récupération du score.', ephemeral: true });
                }

                let newScore = results.length ? results[0].Score + pourcentage : pourcentage;
                if (newScore > 100) newScore = 100; // Limite le score à 100%

                const query = results.length
                    ? 'UPDATE `rank` SET Score = ? WHERE UserId = ?'
                    : 'INSERT INTO `rank` (Score, UserId) VALUES (?, ?)';

                client.database.query(
                    query,
                    [newScore, user.id],
                    (err) => {
                        if (err) {
                            console.error(err);
                            return interaction.reply({ content: 'Erreur lors de la mise à jour du score.', ephemeral: true });
                        }
                        interaction.reply({ content: `Le score de <@${user.id}> a été augmenté à ${newScore}%`, ephemeral: false });
                    }
                );
            }
        );
    },
};
// Copyright © ArtichautDev 2024 All Rights Reserved