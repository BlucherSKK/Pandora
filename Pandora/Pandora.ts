/*
 ________  ________  ________   ________  ________  ________  ________     
|\   __  \|\   __  \|\   ___  \|\   ___ \|\   __  \|\   __  \|\   __  \    
\ \  \|\  \ \  \|\  \ \  \\ \  \ \  \_|\ \ \  \|\  \ \  \|\  \ \  \|\  \   
 \ \   ____\ \   __  \ \  \\ \  \ \  \ \\ \ \  \\\  \ \   _  _\ \   __  \  
  \ \  \___|\ \  \ \  \ \  \\ \  \ \  \_\\ \ \  \\\  \ \  \\  \\ \  \ \  \ 
   \ \__\    \ \__\ \__\ \__\\ \__\ \_______\ \_______\ \__\\ _\\ \__\ \__\
    \|__|     \|__|\|__|\|__| \|__|\|_______|\|_______|\|__|\|__|\|__|\|__|

    author - Blüchеr

    Пандора - простая библиотека на тайп скрипт для создания дискорд ботов для 
    управления фото и видео контентом на серверах, пандора позволяет удобно управлять 
    контентом создоваемым участниками сервера. Библиотека реализует сортировку, 
    хранение и передачу(можно просто насроить отправку архивоф с артами себе в лс к приммеру по пятницам) 
    контента с дискорд серверов.
*/

import { 
    Client, 
    Role, 
    TextChannel, 
    Message, 
    Collection, 
    EmbedBuilder, 
    DMChannel, 
    NewsChannel, 
    AttachmentBuilder, 
    GuildMember, 
    PermissionsBitField, 
    ChannelType, 
    MessagePayload, 
    Routes, 
    GuildChannel,
    Attachment} from 'discord.js';
import type { Channel, PartialGuildMember, GuildBasedChannel, REST, ChatInputCommandInteraction, InteractionReplyOptions, InteractionResponse, MessageCreateOptions } from 'discord.js';
import fetch from 'node-fetch';
import fs from 'fs';
import path, { resolve } from 'path';
import archiver from 'archiver';
import cron from 'node-cron';
import parser, { CronDate, CronExpression } from 'cron-parser';
import { pathToFileURL } from 'url';
import { BR_set_file_downloadeable } from '../HttpGiver';
import exp from 'constants';
import makeWelcome from './makeWelcome';
import { channel } from 'diagnostics_channel';
import https from 'https';


/*
@BruhFn - основной наймспайс для этой либы 
*/
export namespace BruhFn{

    export function setFrideyScheduler(
        client: Client, 
        channelId: string, 
        messageContent: string, 
        filePath: string,
        cronExpression: string,
    ) {
    
        const task = cron.schedule(cronExpression, () => {
            let channel =  client.channels.fetch(channelId);
            if(channel instanceof TextChannel){
                channel.send({
                    content: messageContent,
                    files: [filePath],
                    });
            }
            low.logHandle("Сообшение на пятницу отправлено");
        }, {
            timezone: 'Europe/Moscow'
        });
    }

    /**
    @send_schedule_report - функция для отправки сообшения по дням недели с файлами
      */
    export async function send_schedule_report(dir: string, cron_schedule: string, access_time: number, host: string, channel: TextChannel, client: Client, now: boolean = false) {
        const ReportTask = async () => {
            let archive_path = "archiv.zip";
            channel.send({
                    embeds: [{
                        title: "Everyweakly report.",
                        fields: [
                            { name: "Download link:", value: `https://${host}:3000/download/${archive_path}`, inline: true },
                        ],
                        color: 0x00ff95
                    }]
                });
            await low.createArchive(dir, archive_path);
            await BR_set_file_downloadeable(archive_path, 3000, host, access_time);
            
            low.clearDir(dir);
            low.clearDir('./tmp');
            fs.unlinkSync(`./${archive_path}`);


            return resolve();
        }
        
        if(now == true){
            ReportTask();
        } else {
            cron.schedule(cron_schedule, async () => {
                ReportTask()
            }, {
                timezone: 'Europe/Moscow'
            });
        }
        
    }
    
    
    /**
     * 
     * @AutoArtSaver - функция запускаемая ВО ВНЕШНЕМ СКОУПЕ!!! и сохроняюшая все медия из опеределённых каналов
     */
    
    export async function AutoArtSaver(client: Client, channelIds: string[],  dir: string, message: Message) {

        const SAVE_DIR = path.join(__dirname, dir);
        let contain: boolean = false;
        for(const ablechanel of channelIds){
            if(ablechanel == message.channel.id){
                contain = true;
                break;
            }
        }

        if (contain && (message.attachments.size != 0)) {
            message.attachments.forEach((attachment) => {
                const filePath = path.join(SAVE_DIR, attachment.name);

                // Загружаем файл
                const file = fs.createWriteStream(filePath);
                https.get(attachment.url, (response) => {
                    response.pipe(file);
                    file.on('finish', () => {
                        file.close();
                        low.logHandle(`Файл сохранен: ${filePath}`);
                    });
                }).on('error', (error) => {
                    fs.unlink(filePath, () => {}); // Удаляем файл в случае ошибки
                    low.logHandle(`Ошибка при сохранении файла: ${error.message}`);
                });
            });
        
        }
    }


    /**
     * 
     * @regist_commands - функция для регистрации слеш-коммандбота
     */
    export async function regist_commands(commands: {
        name: string,
        description: string,
    }[],
    rest: REST,
    cliendID: string,
    guidID: string
    ): Promise<void> {
        try {
            await rest.put(Routes.applicationGuildCommands(cliendID, guidID), {
                body: commands,
            });
    
            low.logHandle('Команды успешно обновлены!');
        } catch (error) {
            low.logHandle(error);
        }
    }


    /**
    @interect - наймспайс с функциями для обработки комманд бота
     */
    export namespace interect{

        interface AnimeImage {
            jpg: {
                large_image_url: string;
            };
        }

        interface Anime {
            mal_id: number;
            title: string;
            images: AnimeImage;
        }

        interface SearchResponse {
            data: Anime[];
        }


        export async function random_anime_from_txt(interact: ChatInputCommandInteraction) {
            const { commandName, channel } = interact;

            if (commandName !== "random_anime") { return; }
            if (!(channel instanceof TextChannel)) { return; }

            const url = interact.options.getString("url");
            if (url) {
                // Извлекаем ID канала и ID сообщения из URL
                const regex = /https:\/\/discord\.com\/channels\/(\d+)\/(\d+)\/(\d+)/;
                const match = url.match(regex);

                if (match) {
                    const guildId = match[1];
                    const channelId = match[2];
                    const messageId = match[3];

                    try {
                        // Получаем канал и сообщение
                        const targetChannel = await channel.guild.channels.fetch(channelId) as TextChannel;
                        const message = await targetChannel.messages.fetch(messageId);

                        // Проверяем наличие вложений
                        if (message.attachments.size > 0) {
                            const attachment = message.attachments.first();
                            if (attachment && attachment.name.endsWith('.txt')) {
                                const text = await (await fetch(attachment.url)).text();
                                const lines = text.split('\n').filter(line => line.trim() !== '');

                                if (lines.length > 0) {
                                    const animeName = lines[Math.floor(Math.random() * lines.length)];
                                    const searchResponse = await fetch(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(animeName)}&sfw`);
                                    const searchData: SearchResponse = await searchResponse.json() as SearchResponse; // Указываем тип данных

                                    if (searchData && searchData.data.length > 0) {
                                        const animeId = searchData.data[0].mal_id; // Получаем ID первого результата
                                        const bannerUrl = searchData.data[0].images.jpg.large_image_url; // Получаем URL баннера

                                        console.log(`ID аниме: ${animeId}`);
                                        console.log(`Баннер аниме: ${bannerUrl}`);
                                        if(animeId && bannerUrl){
                                            const reply_entity = new EmbedBuilder()
                                                .setTitle('Думаю вам стоит посмотреть это')
                                                .setDescription(animeName)
                                                .setColor(0x009999)
                                                .setImage(bannerUrl)

                                            await interact.reply({ embeds: [reply_entity] });
                                            await low.logHandle(`Запрос на рандомайзинг аниме из файла ${url} выполнен`);
                                            return;
                                        } else {
                                            low.logHandle("Ошибка парсинга данных")
                                        }
                                    } else {
                                        console.log('Аниме не найдено.');
                                    }
                                } else {
                                    await low.send_deletable_reply(interact, `В файле ${attachment.name} ничего нет.`);
                                }
                            } else {
                                await low.send_deletable_reply(interact, "Я умею читать только .txt файлы.");
                            }
                        } else {
                            await low.send_deletable_reply(interact, 'У этого сообщения нет вложений.');
                        }
                    } catch (error) {
                        console.error(error);
                        await low.send_deletable_reply(interact, 'Не удалось получить сообщение. Проверьте ссылку.');
                    }
                } else {
                    await low.send_deletable_reply(interact, 'Некорректная ссылка на сообщение.');
                }
            } else {
                await low.send_deletable_reply(interact, 'Пожалуйста, предоставьте ссылку на сообщение с вложенным файлом.');
            }
        }


        export async function call_debug(interect: ChatInputCommandInteraction, host: string, client: Client) {
            const { commandName, member, channel } = interect;
            
            if(commandName != "call_debug"){return}
            if(!(channel instanceof TextChannel)){return}
            if(!(member instanceof GuildMember)){return}
            if(!member.permissions.has(PermissionsBitField.Flags.ManageMessages)){return}

            switch (interect.options.getString("name")){
                case "schedule_repoprt":
                    try { 
                        low.send_deletable_reply(interect, "жди пробный запуск schedule_report()");
                        BruhFn.send_schedule_report("./hentaiStaff","", 24*3600, host, channel, client, true);
                    }
                    catch(error) { interect.reply(`Ошибка: ${error as string}`) }
                    return;
                default:
                    low.send_deletable_reply(interect, "Функция не найдена")
            }
        }

        export async function getTimeUntilFriday(interect: ChatInputCommandInteraction) {
            const { commandName, member, channel } = interect;

            if(commandName != "when_friday"){return}

            const nowUTC = new Date(); // Текущее время по UTC
            const mskOffset = 3 * 60 * 60 * 1000; // Смещение для MSK (UTC+3)
            const nowMSK = new Date(nowUTC.getTime() + mskOffset); // Текущее время по MSK

            const daysUntilFriday = (5 - nowMSK.getUTCDay() + 7) % 7; // 5 = пятница
            const nextFriday = new Date(nowMSK.getTime() + daysUntilFriday * 24 * 60 * 60 * 1000);
            nextFriday.setHours(10, 0, 0, 0); // Устанавливаем 10:00 по MSK

            // Если сейчас пятница до 10:00, считать, что время до следующей пятницы
            if (daysUntilFriday === 0 && nowMSK.getHours() < 10) {
                nextFriday.setTime(nextFriday.getTime() + 7 * 24 * 60 * 60 * 1000); // Добавить 7 дней
            }

            const timeDifference = nextFriday.getTime() - nowMSK.getTime();
            const totalSeconds = Math.floor(timeDifference / 1000);
            const hours = Math.floor(totalSeconds / 3600); // 3600 секунд в часе
            const minutes = Math.floor((totalSeconds % 3600) / 60); // Остаток минут
            const seconds = totalSeconds % 60; // Остаток секунд

            if(channel instanceof TextChannel){
                low.send_deletable_reply(interect, `Скоро:
            ${hours} часов ${minutes} минут ${seconds} секунд`);
            };
        }

        export async function Info(interect: ChatInputCommandInteraction, time: number) {
            const { commandName, member, channel } = interect;

            if(commandName != "info"){return}
            if(!(member instanceof GuildMember)){return}

            const version = '1.5.4';
            const lastUpdate = '2025-22-06';
        
            const uptime = time.toString() + ` часов 
            *или часа ну в обшем сами разберётесь кожанные*`;
        
            const embed = new EmbedBuilder()
                .setTitle('Информация о боте')
                .setColor(0x9834db)
                .setImage('https://cdn.discordapp.com/app-icons/1240895608454385695/1ff43e19cb1aae20d6bf5688839c6cbb.png?size=512')
                .addFields(
                    { name: 'Версия бота', value: version, inline: false },
                    { name: 'Дата последнего обновления', value: lastUpdate, inline: false },
                    { name: "Время работы", value: uptime, inline: false },
                )
            
            if (channel instanceof TextChannel) {
                await interect.reply({ embeds: [embed] });
            } else {
                low.logHandle("Канал не поддерживает отправку сообщений.");
            }
        }
        

        /**
         * @clear - функциия для обработки админской команды на удоление сообшений
         */
        export async function clear(interect: ChatInputCommandInteraction): Promise<ChatInputCommandInteraction | void> {
            const { commandName, member, channel } = interect;

            if(commandName != "clear"){
                return;
            }

            const member_as = member as GuildMember;
            const channel_as = channel as Channel;
            const arg = interect.options.getInteger('quantity') as number;

            if (arg < 1 || arg > 300) {
                await low.send_deletable_massage(channel_as, 'Укажите количество сообщений для удаления (от 1 до 300).');
                return;
            }

            if (!member_as.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
                await low.send_deletable_massage(channel_as, 'У вас нет разрешения на удаление сообщений.');
                return;
            }

            if (channel_as instanceof TextChannel) {
                try {
                    console.log(`Удаляем ${arg} сообщений из канала ${channel_as.name}`);

                    const fetchedMessages = await channel_as.messages.fetch({ limit: arg });
                    const deletedMessages = await channel_as.bulkDelete(fetchedMessages, true);

                    console.log(`Удалено сообщений: ${deletedMessages.size}`);
                    low.send_deletable_reply(interect, `Удалено ${deletedMessages.size} сообщений.<:literally1984:1286290240633442425>`);
                
                } catch (error) {
                    console.error('Ошибка при удалении сообщений:', error);
                    await low.send_deletable_massage(channel_as, 'Произошла ошибка при удалении сообщений.');
                }
            } else {
                await low.send_deletable_massage(channel_as, 'Эта команда доступна только в текстовых каналах.');
            }
            
        }


        /**
         * 
         * @OneTimeSaver - функция сохроняюшая в бота арты за определённый перюд по админской кооманде
         */
        export async function OneTimeSaver(interect: ChatInputCommandInteraction, channelIds: string[], direkt: string, client: Client) {
            const { commandName, member, channel } = interect;

            if(commandName != "save_from_date"){return}

            if(!(member instanceof GuildMember)){return}

            if(!(channel instanceof TextChannel)){return}

            const SAVE_DIR = path.join(__dirname, direkt); // Directory to save media files
        
            if (!fs.existsSync(SAVE_DIR)) {
                fs.mkdirSync(SAVE_DIR);
            }
        
            if (!(member ? member.permissions.has(PermissionsBitField.Flags.Administrator) : false)) {
                return interect.reply('У вас недостаточно прав для выполнения этой команды.');
            }

            let YYstart: number;
            let MMstart: number;
            let DDstart: number;
            let YYend: number;
            let MMend: number;
            let DDend: number;
            try{
                YYstart = interect.options.getInteger("yys") as number;
                MMstart = interect.options.getInteger("mms") as number - 1;
                DDstart = interect.options.getInteger("dds") as number;
                YYend = interect.options.getInteger("yye") as number;
                MMend = interect.options.getInteger("mme") as number - 1;
                DDend = interect.options.getInteger("dde") as number;
            } catch(error) {
                interect.reply(`Ты что за говно ввёл? ${error}`);
                return;
            }
            const startDate = new Date(YYstart, MMstart, DDstart);
            const endDate = new Date(YYend, MMend, DDend);
            
            interect.reply("жди");

            const mediaUrls: string[] = [];
    
            for (const channelId of channelIds) {
                const channel1 = client.channels.cache.get(channelId);
                if (channel1 instanceof TextChannel) {
                    try {
                        const messages = await channel1.messages.fetch({ limit: 100 });
                        console.log(`Fetched ${messages.size} messages from channel ${channelId}`);
    
                        messages.forEach((msg: Message) => {
                            console.log(`Message created at: ${msg.createdAt}`);
                            if (msg.createdAt.getTime() >= startDate.getTime() && msg.createdAt.getTime() <= endDate.getTime()) {
                                console.log(`Message within date range: ${msg.createdAt}`);
                                msg.attachments.forEach((attachment) => {
                                    console.log(`Media found: ${attachment.url}`);
                                    mediaUrls.push(attachment.url);
                                });
                            }
                        });
                    } catch (error) {
                        console.error(`Ошибка при получении сообщений из канала ${channelId}:`, error);
                        return low.send_deletable_massage(channel, 'Произошла ошибка при попытке получить сообщения из канала.');
                    }
                }
            }
    
            if (mediaUrls.length === 0) {
                low.send_deletable_massage(channel, 'За это время ничего не найдено');
                return;
            }
            for (const url of mediaUrls) {
                try {
                    const fileName = path.basename(url.split('?')[0]);
                    const response = await fetch(url);
                    if(response.body == null){return low.send_deletable_massage(channel, "Ощибка получения тела запроса")};
                    const fileStream = fs.createWriteStream(path.join(SAVE_DIR, fileName));
                    response.body.pipe(fileStream);
                    low.logHandle(`Файл сохранен: ${fileName}`);
                } catch (error) {
                    low.logHandle(`Ошибка при скачивании файла ${url}: ${error}`);
                    return low.send_deletable_massage(channel, `Не удалось скачать файл ${url}.`);
                }1_000
            }
    
            low.send_deletable_massage(channel, `Сохранено ${mediaUrls.length} медиа файлов в директорию ${SAVE_DIR}.`);
        }
    }
    
    

    /**
     * @MemderActionHandler - наймспайс с функциями для обработки других действий пользователей
     */
    export namespace MemberHandler{
        export async function NewMember(member: GuildMember, channelID: string) {
            const channel = member.guild.channels.cache.get(channelID);
            if (!(channel instanceof TextChannel)) {
                console.log('Модуль велкомГиф: Не нашёл канал!');
                return;
            }
        
            await low.addRole(member, '1239845097978204211', '1239995777858797639'); // Используем функцию для добавления роли
        
            await makeWelcome(member.displayName, member.user.displayAvatarURL({ size: 128, extension: 'png' }), 426, 240, `./tmp/${member.id}.png`);
        
            await new Promise((resolve) => {
                Bun.spawn({
                    cmd: [
                        'ffmpeg',
                        '-y',
                        '-i', './assets/background.gif',
                        '-i', `./tmp/${member.id}.png`,
                        '-filter_complex', 'overlay=0:0',
                        `./tmp/${member.id}.gif`
                    ],
                    cwd: __dirname,
                    onExit: resolve
                });
            });
        
            
            try{
                if (channel && channel.isTextBased()) {
                await channel.send({
                    content: `Добро пожаловать ${member}!`,
                    files: [`./tmp/${member.id}.gif`]
            })}
            }catch(error){
                console.error('При обработке нового пользователя возникла ошибка:', error)
            };
        }

        export async function LeaveMember(member: GuildMember | PartialGuildMember, channelId: string): Promise<void> {
            try {
                    const channel = member.guild.channels.cache.get(channelId) as TextChannel;
                    if (channel) {
                        const userInfo = {
                            content: `Участник ливнул: @${member.user.tag}`,
                            embeds: [{
                                title: "Информация о пользователе",
                                thumbnail: {
                                        url: member.user.displayAvatarURL()
                                },
                                fields: [
                                    { name: "Имя пользователя", value: member.user.username, inline: true },
                                    { name: "Тег", value: `#${member.user.discriminator}`, inline: true },
                                    { name: "ID пользователя", value: member.user.id, inline: true },
                                ],
                                color: 0xc33740
                            }]
                        };
                        await channel.send(userInfo);
                        console.log(`${member.user.tag} покинул сервер.`);
                    } else {
                        console.log('Канал для отправки сообщения не найден.');
                    }
            } catch (error) {   
                low.logHandle(`Ошибка при обработке пользователя покинувшего сервер: ${error}`);
            }
        }
    }

    /**
     * @low - наймспайс с приватными фунциями библиотеки, инкапсулируюшими определённые системные функции
     */
    namespace low{
        export async function addRole(member: GuildMember, roleId: string, channelId: string): Promise<void> {
            try {
                const role: Role | undefined = member.guild.roles.cache.get(roleId);
                if (role) {
                    await member.roles.add(role);
                    console.log(`${member.user.tag} теперь имеет роль '${role.name}'`);
        
                    // Получаем канал по ID
                    const channel = member.guild.channels.cache.get(channelId) as TextChannel;
                    if (channel) {
                        // Формируем сообщение с информацией об участнике
                        const userInfo = {
                            content: `Новый участник: @${member.user.tag}`,
                            embeds: [{
                                title: "Информация о пользователе",
                                thumbnail: {
                                        url: member.user.displayAvatarURL() // Аватар пользователя
                                },
                                fields: [
                                    { name: "Имя пользователя", value: member.user.username, inline: true },
                                    { name: "Тег", value: `#${member.user.discriminator}`, inline: true },
                                    { name: "ID пользователя", value: member.user.id, inline: true },
                                ],
                                color: 0x9834db // фиолетовый цвет для сообщения
                            }]
                        };
                        
                        // Отправляем сообщение в канал
                        await channel.send(userInfo);
                        console.log(`${member.user.tag} зашёл на сервер.`);
                    } else {
                        console.log('Канал для отправки сообщения не найден.');
                    }
                } else {
                    console.log('Роль не найдена.');
                }
            } catch (error) {   
                console.error('Ошибка при добавлении роли и отправке сообщения:', error);
            }
        }
        export async function send_deletable_massage(channel: Channel, content: string, opt_time?: number): Promise<Message | null> {
            low.logHandle(`Отправлено предупреждаюшее сообшение: ${content}`);
            if (channel instanceof TextChannel) {
                const dotmessage = await channel.send(content);
                if (typeof(opt_time) == typeof(undefined)) {
                    setTimeout(async () => {
                        await dotmessage.delete();
                    }, 10_000
                    );
                } else {
                    setTimeout(async () => {
                        await dotmessage.delete();
                    }, opt_time
                    );
                }
                return dotmessage;
            }
            return null;
        }
        export async function send_deletable_reply(interect: ChatInputCommandInteraction, content: string | InteractionReplyOptions, time?: number ): Promise<InteractionResponse | null> {
            const {member, commandName, channel} = interect;
            if(channel instanceof TextChannel){
                const dotmessage = await interect.reply(content);
                if (typeof(time) == typeof(undefined)) {
                    setTimeout(async () => {
                        await dotmessage.delete();
                    }, 10_000
                    );
                } else {
                    setTimeout(async () => {
                        await dotmessage.delete();
                    }, time
                    );
                }
                return dotmessage;
            }
            return null;
        } 
        export async function logHandle(logContent: any, filePath?: string): Promise<void> {
            if(logContent instanceof String){
                logContent = logContent as string;
            }else if ( logContent instanceof Error){
                logContent = logContent.message;
            }else{
                try{
                    logContent = logContent as string;
                } catch {
                logContent = "Вызов logHandle с невалидным телом сообщения";
                }
            }

            const currentTime = new Date().toLocaleString();
            const logEntry = `${currentTime} - ${logContent}\n`; 
        
            console.log(logEntry);
            
            if(typeof(filePath) == typeof(undefined)){
                filePath = "./bruh.log";
            } else {
                filePath = filePath as string;
            }
            fs.appendFile(filePath, logEntry, (err) => {
                if (err) {
                    console.error('Ошибка при добавлении строки в файл:', err);
                }
            });
        }
        export function clearDir(directory: string): void {
            if (fs.existsSync(directory)) {
                const files = fs.readdirSync(directory);
                for (const file of files) {
                    fs.unlinkSync(path.join(directory, file));
                }
            }
        }
        export function createArchive(sourceDir: string, outputFile: string): Promise<void> {
            return new Promise((resolve, reject) => {
                const output = fs.createWriteStream(outputFile);
                const archive = archiver('zip', {
                    zlib: { level: 9 },
                });

                output.on('close', () => resolve());
                archive.on('error', (err) => reject(err));

                archive.pipe(output);
                archive.directory(sourceDir, false);
                archive.finalize();

                return archive;
            });
        }

    }

    
};



