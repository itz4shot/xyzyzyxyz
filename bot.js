const { Client, GatewayIntentBits, Partials } = require('discord.js');
const express = require('express');
const fetch = require('node-fetch'); // Required for fetching attachments
const config = require('./config');

const TOKEN = config.TOKEN || process.env.TOKEN;
const PORT = process.env.PORT || 3000; // Default port

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

// Conversion functions
function convertQBCoreToESX(script) {
    let convertedScript = script
        .replace(/QBCore\.Functions\.GetPlayer\((.*?)\)/g, 'ESX.GetPlayerFromId($1)')
        .replace(/exports\['qb-core'\]:GetCoreObject\(\)/g, 'while ESX == nil do')
        .replace(/QBCore:Notify/g, 'esx:showNotification')
        .replace(/QBCore/g, 'ESX')
        .replace(/QBCore\.Functions\.TriggerCallback\((.*?),\s*function/g, 'ESX.TriggerServerCallback($1, function')
        .replace(/TriggerClientEvent\('QBCore:Notify',/g, 'TriggerClientEvent(\'esx:showNotification\',')
        .replace(/TriggerEvent\('QBCore:Client:CreateBlip',/g, 'TriggerEvent(\'esx:client:CreateBlip\',')
        .replace(/RegisterNetEvent\("QBCore:Client:.*?"/g, match => match.replace('QBCore:', 'esx:'))
        .replace(/QBCore\.Functions\..*?(\bget\w+)/g, 'ESX.Get$1') // Generic function replacement
        .replace(/QBCore\..*?(\bNotify|Blip)/g, 'ESX.$1'); // General replacements for notifications and blips
    return convertedScript;
}

function convertESXToQBCore(script) {
    let convertedScript = script
        .replace(/ESX\.GetPlayerFromId\((.*?)\)/g, 'QBCore.Functions.GetPlayer($1)')
        .replace(/while ESX == nil do/g, "local QBCore = exports['qb-core']:GetCoreObject()")
        .replace(/esx:showNotification/g, 'QBCore:Notify')
        .replace(/ESX/g, 'QBCore')
        .replace(/ESX\.TriggerServerCallback\((.*?),\s*function/g, 'QBCore.Functions.TriggerCallback($1, function')
        .replace(/TriggerClientEvent\('esx:showNotification',/g, 'TriggerClientEvent(\'QBCore:Notify\',')
        .replace(/TriggerEvent\('esx:client:CreateBlip',/g, 'TriggerEvent(\'QBCore:Client:CreateBlip\',')
        .replace(/RegisterNetEvent\("esx:.*?"/g, match => match.replace('esx:', 'QBCore:'))
        .replace(/ESX\.Get.*?(\bget\w+)/g, 'QBCore.Functions.Get$1') // Generic function replacement
        .replace(/ESX\.Notify|Blip/g, 'QBCore.$1'); // General replacements for notifications and blips
    return convertedScript;
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
