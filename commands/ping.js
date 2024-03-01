const { SlashCommandBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Affiche le ping du bot'),
    async execute(interaction) {
        const before = Date.now(); // Marque le temps avant l'envoi de la réponse
        try {
            await interaction.reply({content: 'Calcul du ping...'});
            const after = Date.now(); // Marque le temps après l'envoi de la réponse
            const roundTripPing = after - before; // Calcule le "ping de commande" en soustrayant before de after
            const ms = roundTripPing/7
            await interaction.editReply({content: `Ping : ${ms.toFixed(0)} ms.`});
            console.log(`[INFO] ${interaction.user.tag} (${interaction.user.id}) issued command: /ping`);
        } catch (e) {
            console.log(e);
        }
    },
};
