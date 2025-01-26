require('dotenv').config();
const { Client } = require('discord.js');
const client = new Client({ intents: [] });

client.on('ready', () => {
    console.log(`Bot iniciado como ${client.user.tag}`);
    process.exit();
});

client.login(process.env.DISCORD_TOKEN);