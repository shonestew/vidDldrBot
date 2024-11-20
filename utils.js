const { alldl } = require('rahad-all-downloader');
const rh = require('rahad-media-downloader');
const axios = require('axios');
const url = require('url');

const ytDomains = ['www.youtube.com', 'youtube.com', 'm.youtube.com', 'youtu.be'];
const ttDomains = ['www.tiktok.com', 'tiktok.com', 'm.tiktok.com', 'vt.tiktok.com'];

async function handleVideoDownload(ctx) {
    try {
        const chatId = ctx.message.chat.id;
        const reply = ctx.message.reply_to_message;
        const msg = ctx.message.text.slice(1);
        const args = msg.split(' ');
        const urlVideo = args[1];

        if (reply) {
            const repliedText = reply.text;
            if (!repliedText.startsWith('https://') && !repliedText.startsWith('http://')) {
                ctx.telegram.sendMessage(chatId, ' ❌ Сообщение кроме ссылки содержит лишний текст!', {
                    disable_web_page_preview: true,
                });
            } else {
                sendUrlVideo(ctx, repliedText);
            };
        } else if (args.length === 2) {
            sendUrlVideo(ctx, urlVideo);
        } else {
            ctx.telegram.sendMessage(chatId, ' ❌ Вы забыли указать в аргументе ссылку или ответить командой на ссылку!');
        };
    } catch (e) {
        console.log(e);
    };
};

async function sendUrlVideo(ctx, urlVideo) {
    try {
        const parsedUrl = url.parse(urlVideo, true);
        let domain = parsedUrl.host.replace('/shorts');

        if (domain == 'vm.tiktok.com') {
            urlVideo = 'https://vt.tiktok.com' + parsedUrl.path;
            domain = 'vt.tiktok.com';
        };

        if (ytDomains.includes(domain)) {
            const res = await alldl(urlVideo);
            const resFileSize = await axios.head(res.data.videoUrl);
            const fileSize = resFileSize.headers['content-length'];
            console.log(fileSize)

            if (fileSize >= 52428799) {
                ctx.telegram.sendMessage(ctx.message.chat.id, ` ❌ Не получилось загрузить видео напрямую в Телеграмм, так как оно весит более 50 мб.\n <a href='${res.data.videoUrl}'>🔗 Прямая ссылка на видео</a>`, {
                    parse_mode: 'HTML',
                });
            } else {
                ctx.replyWithVideo(res.data.videoUrl, {
                    reply_to_message_id: ctx.message.message_id,
                });
            };
        } else if (ttDomains.includes(domain)) {
            const res = await alldl(urlVideo);
            const resFileSize = await axios.head(res.data.videoUrl);
            const fileSize = resFileSize.headers['content-length'];

            if (fileSize >= 52428799) {
                ctx.replyWithHTML(` ❌ Не получилось загрузить видео напрямую в Телеграмм, так как оно весит более 50 мб.\n <a href='${res.data.videoUrl}'>🔗 Прямая ссылка на видео</a>`, {
                    reply_to_message_id: ctx.message.message_id,
                });
            } else {
                ctx.replyWithVideo(res.data.videoUrl, {
                    reply_to_message_id: ctx.message.message_id,
                });
            };
        } else {
            ctx.telegram.sendMessage(ctx.message.chat.id, ' ❌ Это не ссылка на видео на платформе "Youtube" или "Tiktok"!');
        };
    } catch (e) {
        console.error(e);
        if (e.message == '400: Bad Request: wrong file identifier/HTTP URL specified') {
            const res = await alldl(urlVideo);
            ctx.replyWithHTML(` ❌ Не получилось загрузить видео напрямую в Телеграмм по неизвестным причинам.\n <a href='${res.data.videoUrl}'>🔗 Прямая ссылка на видео</a>`, {
                reply_to_message_id: ctx.message.message_id,
            });
            console.log('Проблемы с выводом видео, а именно - ', e.message);
        };
    };
};

async function sendUrlPhoto(ctx, urlPhoto) {
    try {
        const parsedUrl = url.parse(urlPhoto, true);
        let domain = parsedUrl.host;

        if (domain == 'vm.tiktok.com') {
            urlPhoto = 'https://vt.tiktok.com' + parsedUrl.path;
            domain = 'vt.tiktok.com';
        };

        if (ttDomains.includes(domain)) {
           const res = await rh.rahadtikdl(urlPhoto);
           const photos = res.data.images;
           const media = photos.map(path => ({
               type: 'photo',
                media: path
           }));

            ctx.replyWithMediaGroup(media, {
                reply_to_message_id: ctx.message.message_id,
            });
        } else {
            ctx.telegram.sendMessage(ctx.message.chat.id, ' ❌ Это не ссылка на картинку/картинки на платформе"Tiktok"!');
        };
    } catch (e) {
        console.log(e);
    };
};

async function handlePhotoDownload(ctx) {
    try {
        const chatId = ctx.message.chat.id;
        const reply = ctx.message.reply_to_message;
        const msg = ctx.message.text.slice(1);
        const args = msg.split(' ');
        const urlPhoto = args[1];

        if (reply) {
            const repliedText = reply.text;
            if (!repliedText.startsWith('https://') && !repliedText.startsWith('http://')) {
                ctx.telegram.sendMessage(chatId, ' ❌ Сообщение кроме ссылки содержит лишний текст!', {
                    disable_web_page_preview: true,
                });
            } else {
                sendUrlPhoto(ctx, repliedText);
            };
        } else if (args.length === 2) {
            sendUrlPhoto(ctx, urlPhoto);
        } else {
            ctx.telegram.sendMessage(chatId, ' ❌ Вы забыли указать в аргументе ссылку или ответить командой на ссылку!');
        };
    } catch (e) {
        console.log(e);
    };
};

module.exports = { handleVideoDownload, handlePhotoDownload, sendUrlVideo, sendUrlPhoto };