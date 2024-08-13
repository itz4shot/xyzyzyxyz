const { Client, GatewayIntentBits, Partials } = require('discord.js');
const express = require('express');
const config = require('./config');

const TOKEN = config.TOKEN || process.env.TOKEN;
const PORT = process.env.PORT || 3000; // Use PORT environment variable or default to 3000

const app = express();
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
    partials: [Partials.Message],
});

// Simple HTTP server to keep the service alive
app.get('/', (req, res) => {
    res.send('Bot is running');
});

app.listen(PORT, () => {
    console.log(`HTTP server running on port ${PORT}`);
});

// Define conversion functions
function convertQBCoreToESX(script) {
    return script.replace("local QBCore = exports['qb-core']:GetCoreObject()", "while ESX == nil do");
}

function convertESXToQBCore(script) {
    return script.replace("while ESX == nil do", "local QBCore = exports['qb-core']:GetCoreObject()");
}

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
    if (message.content.startsWith('/esxtoqb')) {
        if (message.attachments.size > 0) {
            const attachment = message.attachments.first();
            const response = await fetch(attachment.url);
            const script = await response.text();
            const convertedScript = convertESXToQBCore(script);
            await message.reply({
                content: 'Converted script:',
                files: [{ attachment: Buffer.from(convertedScript), name: 'converted_script.lua' }],
            });
            await message.reply('Conversion finished! Join our Discord: https://discord.gg/fivemframework');
        } else {
            message.reply('Please attach a script to convert.');
        }
    }

    if (message.content.startsWith('/qbtoesx')) {
        if (message.attachments.size > 0) {
            const attachment = message.attachments.first();
            const response = await fetch(attachment.url);
            const script = await response.text();
            const convertedScript = convertQBCoreToESX(script);
            await message.reply({
                content: 'Converted script:',
                files: [{ attachment: Buffer.from(convertedScript), name: 'converted_script.lua' }],
            });
            await message.reply('Conversion finished! Join our Discord: https://discord.gg/fivemframework');
        } else {
            message.reply('Please attach a script to convert.');
        }
    }
});

// Log in to Discord using the token
client.login(TOKEN);
