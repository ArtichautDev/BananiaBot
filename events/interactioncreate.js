const { ChannelType, PermissionsBitField, EmbedBuilder, ButtonBuilder, ActionRowBuilder, SelectMenuBuilder,ButtonStyle } = require('discord.js');
const fs = require("fs");
module.exports = {
    name: "interactionCreate",
    once: false,
    async execute(interaction) {
        if (interaction.isButton()) {
            //get the button id
            const buttonid = interaction.customId;
            //if the button id start with T- open the ticket
            if (buttonid.startsWith("T-")) {
                //get the ticket guild id
                const guildid = interaction.guild.id;
                //create the ticket channel
                const channel = await interaction.guild.channels.create(`ticket-${interaction.user.name}`, {
                    type: ChannelType.GUILD_TEXT,
                    permissionOverwrites: [
                        {
                            id: interaction.user.id,
                            allow: [PermissionsBitField.VIEW_CHANNEL, PermissionsBitField.SEND_MESSAGES, PermissionsBitField.ATTACH_FILES, PermissionsBitField.READ_MESSAGE_HISTORY, PermissionsBitField.USE_EXTERNAL_EMOJIS, PermissionsBitField.ADD_REACTIONS],
                        },
                        {
                            id: interaction.guild.roles.everyone,
                            deny: [PermissionsBitField.VIEW_CHANNEL],
                        },
                    ],
                });
                await interaction.deferReply();
                await interaction.deleteReply();
            }
        }
        if (interaction.isChatInputCommand()) {
            const command = interaction.client.commands.get(interaction.commandName);
    
            if (!command) return;
    
            try {
                await command.execute(interaction);
            } catch (err) {
                if (err) console.error(err);
        
                await interaction.reply({
                    content: "An error occurred while executing that command.",
                    ephemeral: true,
                });
            }
        }
    }
}
// Copyright © ArtichautDev 2023 All Rights Reserved