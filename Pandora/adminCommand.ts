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
    User} from 'discord.js';
import { BruhFn } from './Pandora';
import fs from 'fs';

enum AdminCommandRequaType {
    Ok,
    Error,
}

export interface AdminCommandRequa {
    content?: string;
    type: AdminCommandRequaType;
    del_msg?: boolean; // надо ли удолять искомое сообшениее по дефолту да
    del_rep?: boolean; // надо ли удалять ответ по дефолту да
    del_rep_dely?: number; // задержка перед удоление ответа в секундах по дефолту будет 10 
}

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

export async function clear_anime_list(msg: Message, filePath: string): Promise<void> {
    await fs.writeFileSync(filePath, "", 'utf-8');
}

export async function clear(msg: Message): Promise<AdminCommandRequa | void> {

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