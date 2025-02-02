import discord
from discord.ext import commands
import os
import asyncio
import yt_dlp as youtube_dl
from dotenv import load_dotenv
import yt_dlp

# Cargar variables del entorno
load_dotenv()
TOKEN = os.getenv("DISCORD_TOKEN")

# Configuración del bot con intents correctos
intents = discord.Intents.default()
intents.message_content = True  # Necesario para reconocer comandos
intents.guilds = True
intents.voice_states = True  # Necesario para controlar la voz

bot = commands.Bot(command_prefix="!", intents=intents)

# Configuración de YouTube Downloader
YDL_OPTIONS = {'format': 'bestaudio', 'noplaylist': 'True'}
FFMPEG_OPTIONS = {'options': '-vn'}

# Comando para unirse a un canal de voz
@bot.command()
async def join(ctx):
    if ctx.author.voice is None:
        await ctx.send("❌ Debes estar en un canal de voz para que me una.")
        return
    channel = ctx.author.voice.channel
    
    if ctx.voice_client is not None:
        if ctx.voice_client.channel != channel:  # Verifica si el bot ya está en otro canal
            await ctx.voice_client.move_to(channel)
            await ctx.send(f"🔊 Me moví a {channel.name}!")
        else:
            await ctx.send(f"🔊 Ya estoy en el canal {channel.name}.")
    else:
        await channel.connect()
        await ctx.send(f"🔊 Me uní a {channel.name}!")


# Comando para salir del canal de voz
@bot.command()
async def leave(ctx):
    if ctx.voice_client:
        await ctx.voice_client.disconnect()
        await ctx.send("👋 Me desconecté del canal de voz.")
    else:
        await ctx.send("❌ No estoy en un canal de voz.")

# Comando para reproducir música desde YouTube
@bot.command()
async def play(ctx, url: str):
    if not ctx.voice_client:
        await ctx.invoke(join)  # Unirse automáticamente si no está en el canal

    await ctx.send(f"🎵 Buscando {url}...")

    with youtube_dl.YoutubeDL(YDL_OPTIONS) as ydl:
        info = ydl.extract_info(url, download=False)
        url2 = info['url']
        title = info['title']

    ctx.voice_client.stop()
    source = discord.FFmpegPCMAudio(url2, executable=r"C:\Users\juana\OneDrive\Escritorio\FFmpeg\ffmpeg-7.1-essentials_build\bin\ffmpeg.exe", **FFMPEG_OPTIONS)
    ctx.voice_client.play(source)
    await ctx.send(f"🎶 Reproduciendo: **{title}**")

# Comando para detener la música
@bot.command()
async def stop(ctx):
    if ctx.voice_client and ctx.voice_client.is_playing():
        ctx.voice_client.stop()
        await ctx.send("⏹ Música detenida.")
    else:
        await ctx.send("❌ No hay música sonando.")

# Comando para pausar la música
@bot.command()
async def pause(ctx):
    if ctx.voice_client and ctx.voice_client.is_playing():
        ctx.voice_client.pause()
        await ctx.send("⏸ Música pausada.")
    else:
        await ctx.send("❌ No hay música sonando.")

# Comando para reanudar la música
@bot.command()
async def resume(ctx):
    if ctx.voice_client and ctx.voice_client.is_paused():
        ctx.voice_client.resume()
        await ctx.send("▶ Música reanudada.")
    else:
        await ctx.send("❌ La música no está pausada.")


ydl_opts = {
    'user_agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
}

def play(ctx, url):
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        info = ydl.extract_info(url, download=False)
        # Procede con la reproducción

        
# Iniciar el bot
bot.run(TOKEN)
