client.on('ready', () => {
    console.log(`Connecté en tant que ${client.user.tag}`);
    // Vérifie toutes les minutes
    setInterval(() => {
        client.guilds.cache.forEach(guild => {
            guild.voiceStates.cache.forEach(async (voiceState) => {
                if (voiceState.channelId && !voiceState.mute && !voiceState.selfMute) {
                    // Ajoute une minute pour cet utilisateur
                    let userId = voiceState.id;
                    // Assurez-vous d'avoir une logique pour initialiser `userTimeInVoice` à 0 quelque part dans votre code
                    client.database.query(
                        'INSERT INTO voice (UserId, Minutes) VALUES (?, 1) ON DUPLICATE KEY UPDATE Minutes = Minutes + 1',
                        [userId],
                        (error, results) => {
                            if (error) throw error;
                            console.log(`Temps vocal mis à jour pour l'utilisateur ${userId}.`);
                        }
                    );
                }
            });
        });
    }, 60000); // 60000 ms = 1 minute
});

// Copyright © ArtichautDev 2024 All Rights Reserved