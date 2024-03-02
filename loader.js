var mysql = require('mysql2'); 

const fs = require('node:fs');
const path = require('node:path');
const { Collection} = require('discord.js');

//db loader

var con = mysql.createConnection({
  host: `${config.database.host}`,
  user: config.database.user,
  password: config.database.password,
  database: config.database.name
});

require('./src/events')

con.connect(function(err) {
    if (err) throw err;
    console.log("Connected to the Mysql Database!");
    client.database = con;
  });

  client.commands = new Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.data.name, command);
    console.log('[LOG] Command', command.data.name, 'is now ready')
}

const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
    const event = require(`./events/${file}`);
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args));
        console.log('[LOG] Event', event.name, 'is now ready')
    } else {
        client.on(event.name, (...args) => event.execute(...args));
        console.log('[LOG] Event', event.name, 'is now ready')
    }
}
// Copyright © ArtichautDev 2024 All Rights Reserved