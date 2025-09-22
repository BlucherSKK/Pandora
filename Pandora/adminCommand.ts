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
    Attachment,
    PermissionFlagsBits,
    Guild,
    REST, 
    ChatInputCommandInteraction, 
    InteractionResponse,  
    User,
    ALLOWED_SIZES} from 'discord.js';
import { BruhFn } from './Pandora';
import fs from 'fs';
import path, { resolve } from 'path';
import fetch from 'node-fetch';
import {msg_reply} from './adminHandler';
enum AdminCommandRequaType {
    Ok,
    Error,
}

interface AdminCommandRequa {
    content?: string;
    type: AdminCommandRequaType;
    del_msg?: boolean; // надо ли удолять искомое сообшениее по дефолту да
    del_rep?: boolean; // надо ли удалять ответ по дефолту да
    del_rep_dely?: number; // задержка перед удоление ответа в секундах по дефолту будет 10 
}


export type Requa = AdminCommandRequa | undefined;

/*
* Функции здесь должны
    - принмать Message
    - возврашать интерфейс AdminCommandRequa
    - не удалять внутри себя сообшени
    - не отправлять ответы на сообшение внутри себя
 */

export async function get_log_file(message: Message, member: GuildMember, logfilePath: string)
:Promise<AdminCommandRequa> 
{
    member.send({ 
        embeds: [new EmbedBuilder()
            .setTitle("Вот запрошенные логи.")
            .setColor(BruhFn.COLOR.STD_REQUAST)],
        files: [logfilePath]
        });
    return {type: AdminCommandRequaType.Ok};
}

export async function clear_anime_list(msg: Message, filePath: string): Promise<Requa> {
    await fs.writeFileSync(filePath, "", 'utf-8');
    return {type: AdminCommandRequaType.Ok, del_msg: true, del_rep: true}
}

export async function clear(msg: Message): Promise<Requa> {

    const member_as = msg.member as GuildMember;
    const channel_as = msg.channel;
    const arg = Number(msg.content.split(" ")[1]);

    if (arg < 1 || arg > 300) {
        await BruhFn.low.send_deletable_massage(channel_as, 'Укажите количество сообщений для удаления (от 1 до 300).');
        return;
    }

    if (!member_as.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
        await BruhFn.low.send_deletable_massage(channel_as, 'У вас нет разрешения на удаление сообщений.');
        return;
    }

    if (channel_as instanceof TextChannel) {
        try {
            console.log(`Удаляем ${arg} сообщений из канала ${channel_as.name}`);

            const fetchedMessages = await channel_as.messages.fetch({ limit: arg });
            const deletedMessages = await channel_as.bulkDelete(fetchedMessages, true);

            console.log(`Удалено сообщений: ${deletedMessages.size}`);
            return { content: `Удалено ${deletedMessages.size} сообщений.<:literally1984:1286290240633442425>`,
                    type: AdminCommandRequaType.Ok};
        
        } catch (error) {
            BruhFn.low.logHandle(`Ошибка при удалении сообщений: ${error}`);
            return {content: 'Произошла ошибка при удалении сообщений.', type: AdminCommandRequaType.Error};
        }
    } else {
        return {content: 'Эта команда доступна только в текстовых каналах.', type: AdminCommandRequaType.Error};
    }
    
}

export async function call_debug(msg: Message, host: string, client: Client): Promise<Requa> {

    const args = msg.content.split(" ");

    switch (args[1]){
        case "schedule_repoprt":
            if(!(msg.channel instanceof TextChannel)){return;}
            try { 
                BruhFn.send_schedule_report("./hentaiStaff","", 24*3600, host, msg.channel, client, true);
            }
            catch(error) { BruhFn.low.logHandle(`Ошибка: ${error as string}`) }
            return;


        case "friday_message":
            try {
                BruhFn.setFrideyScheduler(client, msg.channel.id, "Тестовая проверка", "./assets/za_pivom.gif", "", true);
            } 
            catch(error) { BruhFn.low.logHandle(`Ошибка: ${error as string}`)}
            return;


        case "member_add":
            try{
                BruhFn.MemberHandler.NewMember(msg.member as GuildMember, msg.channel.id);
            }
            catch(error) { BruhFn.low.logHandle(`Ошибка: ${error as string}`)}
            return;

        default:
            return {content: "Функция не найдена", type: AdminCommandRequaType.Error};
    }
}


export async function OneTimeSaver(msg: Message, channelIds: string[], direkt: string, client: Client): Promise<Requa> {

        if(!(msg.member instanceof GuildMember)){return}
        if(!(msg.channel instanceof TextChannel)){return}

        const SAVE_DIR = path.join(__dirname, direkt); // Directory to save media files
    
        if (!fs.existsSync(SAVE_DIR)) {
            fs.mkdirSync(SAVE_DIR);
        }

        let YYstart: number;
        let MMstart: number;
        let DDstart: number;
        let YYend: number;
        let MMend: number;
        let DDend: number;

        if(msg.content.split(' ').length != 3){return {type: AdminCommandRequaType.Error, content: "Недостаточно аргументов должно были - DD.MM.YY DD.MM.YY"};}

        try{
            const start = msg.content.split(" ")[1];
            YYstart = Number(start.split('.')[2]);
            MMstart = Number(start.split('.')[1]) - 1;
            DDstart = Number(start.split('.')[0]);

            const end = msg.content.split(" ")[2];
            YYend = Number(end.split('.')[2]);
            MMend = Number(end.split('.')[1]); - 1;
            DDend = Number(end.split('.')[0]);;
        } catch(error) {
            
            return {content: `Ты что за говно ввёл? ${error}`, type: AdminCommandRequaType.Error};
        }
        const startDate = new Date(YYstart, MMstart, DDstart);
        const endDate = new Date(YYend, MMend, DDend);
        
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
                    return {content: 'Произошла ошибка при попытке получить сообщения из канала.', type: AdminCommandRequaType.Error};
                }
            }
        }

        if (mediaUrls.length === 0) {
            return {type: AdminCommandRequaType.Error, content: 'За это время ничего не найдено'};
        }
        for (const url of mediaUrls) {
            try {
                const fileName = path.basename(url.split('?')[0]);
                const response = await fetch(url);
                if(response.body == null){return {content: "Ощибка получения тела запроса", type: AdminCommandRequaType.Error}};
                const fileStream = fs.createWriteStream(path.join(SAVE_DIR, fileName));
                response.body.pipe(fileStream);
                BruhFn.low.logHandle(`Файл сохранен: ${fileName}`);
            } catch (error) {
                BruhFn.low.logHandle(`Ошибка при скачивании файла ${url}: ${error}`);
                return {content:`Не удалось скачать файл ${url}.`, type: AdminCommandRequaType.Error};
            }1_000
        }

        return {content: `Сохранено ${mediaUrls.length} медиа файлов в директорию ${SAVE_DIR}.`, type: AdminCommandRequaType.Ok, del_rep: false};
}