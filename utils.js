const { alldl } = require('rahad-all-downloader');
const rh = require('rahad-media-downloader');
const axios = require('axios');
const url = require('url');

const ytDomains = ['www.youtube.com', 'youtube.com', 'm.youtube.com', 'youtu.be'];
const ttDomains = ['www.tiktok.com', 'tiktok.com', 'm.tiktok.com', 'vt.tiktok.com', 'vm.tiktok.com'];

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
                ctx.telegram.sendMessage(chatId, '❌ Сообщение кроме ссылки содержит лишний текст!', {
                    disable_web_page_preview: true,
                });
            } else {
                sendUrlVideo(ctx, repliedText);
            };
        } else if (args.length === 2) {
            sendUrlVideo(ctx, urlVideo);
        } else {
            ctx.telegram.sendMessage(chatId, '❌ Вы забыли указать в аргументе ссылку или ответить командой на ссылку!');
        };
    } catch (e) {
        console.log(e)
    }
};

async function sendUrlVideo(ctx, urlVideo) {
    try {
        const parsedUrl = url.parse(urlVideo, true);
        let domain = parsedUrl?.host.replace('/shorts').replace('youtu.be', 'youtube.com');

        if (domain == 'vm.tiktok.com') {
            urlVideo = 'https://vt.tiktok.com' + parsedUrl?.path;
            domain = 'vt.tiktok.com';
        };

        if (ytDomains.includes(domain)) {
            const res = await alldl(urlVideo);
            console.log(res)
            const resFileSize = await axios.head(res.data.videoUrl);
            const fileSize = resFileSize.headers['content-length'];
            console.log(fileSize)

            if (fileSize >= 52428799) {
                ctx.telegram.sendMessage(ctx.message.chat.id, ` ❌ Не получилось загрузить видео напрямую в Телеграмм, так как оно весит более 50 мб.\n <a href='${res.data.videoUrl}'>🔗 Прямая ссылка на видео</a>`, {
                    parse_mode: 'HTML',
                });
            } else {
                await ctx.replyWithVideo(res.data.videoUrl, {
                    reply_to_message_id: ctx.message.message_id,
                });
            };
        } else if (ttDomains.includes(domain)) {
            const res = await rh.rahadtikdl(urlVideo);
            const photos = res.data.images;

            if (res.data.urlVideo) {
                const resFileSize = await axios.head(res.data.videoUrl);
                const fileSize = resFileSize.headers['content-length'];
            };

            if (res.data.urlVideo && fileSize >= 52428799) {
                ctx.replyWithHTML(` ❌ Не получилось загрузить видео напрямую в Телеграмм, так как оно весит более 50 мб.\n <a href='${res.data.videoUrl}'>🔗 Прямая ссылка на видео</a>`, {
                    reply_to_message_id: ctx.message.message_id,
                });
                return;
            } else if (photos) {
                const media = photos.map(path => ({
                    type: 'photo',
                    media: path
                }));
                console.log(media.join(', '))
                ctx.replyWithMediaGroup(media, {
                    reply_to_message_id: ctx.message.message_id,
                });
            } else {
                ctx.telegram.sendVideo(ctx.message.chat.id, res.data.videoUrl);
            };
        } else {
            ctx.telegram.sendMessage(ctx.message.chat.id, '❌ Это не ссылка на видео в видеохостинге "Youtube" или "Tiktok"!')
        };
    } catch (error) {
        console.error(error.message);
        if (error.message == '400: Bad Request: wrong file identifier/HTTP URL specified') {
            const res = await alldl(urlVideo);
            ctx.replyWithHTML(` ❌ Не получилось загрузить видео напрямую в Телеграмм по неизвестным причинам.\n <a href='${res.data.videoUrl}'>🔗 Прямая ссылка на видео</a>`, {
                reply_to_message_id: ctx.message.message_id,
            });
            console.log('Проблемы с выводом видео, а именно - ', error.message);
            return;
        };
    };
};

module.exports = { handleVideoDownload, sendUrlVideo };