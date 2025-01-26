// Requerimientos
const { Client, GatewayIntentBits } = require('discord.js');
const { Player } = require('discord-player');
const { exec } = require('child_process');

// Crear una nueva instancia del cliente de Discord
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ]
});

// Crear una nueva instancia del reproductor
const player = new Player(client);

// Cuando el bot esté listo
client.on('ready', () => {
    console.log('Tamo ready');
});

// Comando para encender el bot
client.on('messageCreate', (message) => {
    if (message.content === '!startbot') {
        exec('node bot.js', (error, stdout, stderr) => {
            if (error) {
                message.reply(`Error al iniciar el bot: ${error.message}`);
                return;
            }
            if (stderr) {
                message.reply(`Error: ${stderr}`);
                return;
            }
            message.reply(`Bot iniciado: ${stdout}`);
        });
    }
});

// Comando para reproducir música
client.on('messageCreate', async (message) => {
    if (message.content.startsWith('!play')) {
        const args = message.content.split(' ');
        const query = args.slice(1).join(' ');
        const channel = message.member.voice.channel;

        if (!channel) return message.reply('Tienes que estar en un canal de voz para reproducir música!');

        const queue = player.createQueue(message.guild, {
            metadata: {
                channel: message.channel
            }
        });

        try {
            if (!queue.connection) await queue.connect(channel);
        } catch {
            queue.destroy();
            return message.reply('No pude unirme al canal de voz!');
        }

        const track = await player.search(query, {
            requestedBy: message.member
        }).then(x => x.tracks[0]);

        if (!track) return message.reply('No se encontraron resultados!');

        queue.play(track);

        message.reply(`Reproduciendo \`${track.title}\``);
    }
});

// Manejo de errores
client.on('error', console.error);
player.on('error', (queue, error) => {
    console.log(`Error en la cola ${queue.guild.name}: ${error.message}`);
});

// Conectar el bot
client.login(process.env.DISCORD_TOKEN);