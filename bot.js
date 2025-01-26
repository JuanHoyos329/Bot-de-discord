//Requerimientos
const Discord = require('discord.js');

//Cliente
const client = new Discord.Client({
    intents: 3146381
});


//Contenido
client.on("ready", async () => {
    console.log("Tamo ready")
});

//Conectar
client.login(process.env.DISCORD_TOKEN);
