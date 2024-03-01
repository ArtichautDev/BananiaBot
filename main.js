
const { Client, GatewayIntentBits, Partials } = require('discord.js');
const config = require('./config');
global.config = require('./config');


global.client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildVoiceStates
    ],
    partials: [Partials.Channel],
    disableMentions: 'everyone',
});
client.config = require('./config');
require('./loader')
console.log('loader is ready')


client.login(config.app.token);

client.once('ready', async () => {
	console.log(`Logged in as ${client.user.tag}!`);
    client.config = config
});
// Copyright © ArtichautDev 2023 All Rights Reserved