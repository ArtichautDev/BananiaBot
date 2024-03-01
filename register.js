var mysql = require('mysql2'); 
const fs = require('node:fs');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v10');
global.config = require('./config');



console.log('Deploying the application commands')
const commands = [];
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    commands.push(command.data.toJSON());
}

const rest = new REST({ version: '10' }).setToken(config.app.token);

try {
    rest.put(Routes.applicationCommands(config.app.clientId), { body: commands })
        .then(() => console.log('Successfully registered application commands globally.'))
        .catch(console.error);
} catch (e) {
    if(e) console.error(e)
}
