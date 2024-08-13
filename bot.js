const { Client, GatewayIntentBits, Partials } = require('discord.js');
const config = require('./config'); // Import the config file if it exists

// Use the token from config or environment variables
const TOKEN = config.TOKEN || process.env.TOKEN;

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
    partials: [Partials.Message],
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
