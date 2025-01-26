require('dotenv').config(); // Cargar variables de entorno desde el archivo .env
const { Client, GatewayIntentBits } = require('discord.js');
const { Player } = require('discord-player');

// Crear una nueva instancia del cliente de Discord
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});

// Crear una nueva instancia del reproductor
const player = new Player(client, {
    ytdlOptions: {
        quality: 'highestaudio',
        highWaterMark: 1 << 25,
    },
});

// Evento: cuando el bot esté listo
client.on('ready', () => {
    console.log('Bot listo y funcionando');
});

// Evento: manejo de mensajes
client.on('messageCreate', async (message) => {
    if (message.content.startsWith('!play')) {
        const args = message.content.split(' ');
        const query = args.slice(1).join(' '); // Extraer la consulta de búsqueda
        const channel = message.member?.voice?.channel; // Obtener el canal de voz del usuario

        if (!channel) {
            return message.reply('¡Debes estar en un canal de voz para reproducir música!');
        }

        const queue = player.createQueue(message.guild, {
            metadata: {
                channel: message.channel, // Canal donde se enviarán mensajes
            },
        });

        try {
            if (!queue.connection) await queue.connect(channel); // Conectar al canal de voz
        } catch {
            queue.destroy(); // Destruir la cola si no se puede conectar
            return message.reply('No pude unirme al canal de voz.');
        }

        const result = await player.search(query, {
            requestedBy: message.member,
            searchEngine: 'youtube', // Usar YouTube como motor de búsqueda
        });

        if (!result || !result.tracks.length) {
            return message.reply('No se encontraron resultados.');
        }

        const track = result.tracks[0]; // Seleccionar la primera pista
        queue.play(track); // Reproducir la pista en la cola

        message.channel.send(`🎵 Reproduciendo: **${track.title}**`); // Notificar la reproducción
    }
});

// Evento: manejo de errores en el reproductor
player.on('error', (queue, error) => {
    console.error(`Error en la cola (${queue.guild.name}):`, error.message);
});

// Evento: al comenzar una pista
player.on('trackStart', (queue, track) => {
    console.log(`Reproduciendo: ${track.title}`);
});

// Iniciar sesión con el token
client.login(process.env.DISCORD_TOKEN);