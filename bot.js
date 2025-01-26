// Requerimientos
const { Client, Intents } = require('discord.js');
const { Player } = require('discord-player');

// Crear una nueva instancia del cliente de Discord
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_VOICE_STATES, Intents.FLAGS.GUILD_MESSAGES] });

// Crear una nueva instancia del reproductor
const player = new Player(client);

// Cuando el bot esté listo
client.on('ready', () => {
    console.log('Tamo ready');
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

// Conectar el bot
client.login(process.env.DISCORD_TOKEN);
