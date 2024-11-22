const { Telegraf } = require('telegraf');
const { handleVideoDownload, handlePhotoDownload, handleAudioDownload } = require('./utils.js');
require('dotenv').config();

const bot = new Telegraf(process.env.TOKENN);

bot.on('new_chat_members', async (ctx) => {
    const botAdded = ctx.message.new_chat_members.find(member => member.id === ctx.botInfo.id);
    const chatId = ctx.message.chat.id;  
    if (botAdded) {
        ctx.replyWithHTML(`👋 Привет, я - VidDldr! Я умею скачивать видео с платформ "Youtube" и "Tiktok".\n\n📋 Помощь по командам: <a href='https://teletype.in/@shonestew/vidDldrBot_guide'>тык!</a>`);
    };
});

bot.command('start', async (ctx) => {
    const chatId = ctx.message.chat.id;
    ctx.replyWithHTML(`👋 Привет, я - VidDldr! Я умею скачивать видео с платформ "Youtube" и "Tiktok".\n\n📋 Помощь по командам: <a href='https://teletype.in/@shonestew/vidDldrBot_guide'>тык!</a>`);
});

bot.command('vidDldr', async (ctx) => {
    try {
        await handleVideoDownload(ctx);
    } catch (e) {
        console.error('капитан, тут ошибочка:', e.message);
    };
});

bot.command('download', async (ctx) => {
    try {
        await handleVideoDownload(ctx);
    } catch (e) {
        console.error('капитан, тут ошибочка:', e.message);
    };
});

bot.command('ttPhotos', async (ctx) => {
    try {
        await handlePhotoDownload(ctx);
    } catch (e) {
        console.error('капитан, тут ошибочка:', e.message);
    };
});

bot.command('ttMusic', async (ctx) => {
    try {
        await handleAudioDownload(ctx);
    } catch (e) {
        console.error('капитан, тут ошибочка:', e.message);
    };
});

bot.launch();
