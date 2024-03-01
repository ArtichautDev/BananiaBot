module.exports = {
    name: "guildMemberAdd",
    once: false,
    async execute(member) {
        // ID du canal où vous souhaitez envoyer le message de bienvenue
        const welcomeChannelId = "1156668502401364058";

        // Trouver le canal dans la guilde du membre
        const welcomeChannel = member.guild.channels.cache.find(channel => channel.id === welcomeChannelId);

        // Si le canal a été trouvé, envoyer le message de bienvenue
        if (welcomeChannel) {
            welcomeChannel.send(`Bienvenue sur le serveur, ${member} ! Nous sommes ravis de t'avoir parmi nous. N'oublie pas de consulter les règles du serveur et de t'amuser !`);
        } else {
            console.log("Canal de bienvenue introuvable. Assurez-vous d'avoir défini le bon ID de canal.");
        }
    }
}
