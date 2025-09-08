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

export async function message_command_handler(
    msg: Message,
    log_file: string,
): Promise<void> {
    
    if(!(is_moder_message(msg))){return;}
    if(!(msg.member instanceof GuildMember)){return;}

    switch(msg.content){
        case "_get_logs":
            get_log_file(msg, msg.member, log_file);
            break;
        case "_clear_anime_list":
    }


    
}

async function msg_reply(
    rep: string, 
    del_msg: boolean,
    msg: Message,
    del_reply: boolean,
): Promise<void> {
    let reply = await msg.reply(rep);
    if(del_msg){
        try{
            msg.delete();
        } catch {
            BruhFn.low.logHandle(`Ошибка удоления админской комманды: ${msg.content}`);
        }
    }
    if(del_reply){
        setTimeout(async () => {
            try {
                await reply.delete();
            } catch (err) {
                BruhFn.low.logHandle(err);
            }
        }, 10000);
    }
    
}

async function get_log_file(message: Message, member: GuildMember, logfilePath: string) {
    member.send({ 
        embeds: [new EmbedBuilder()
            .setTitle("Вот запрошенные логи.")
            .setColor(BruhFn.COLOR.STD_REQUAST)],
        files: [logfilePath]
        });
}

async function clear_anime_list(msg: Message, filePath: string) {
    await fs.writeFileSync(filePath, "", 'utf-8');
    msg.reply("Готово");
}

export function is_moder_message(message: Message): boolean {
  if (!message.guild || !message.member) return false; // ЛС или отсутствующий member

  // Системные права (часто используются для модерации)
  if (message.member.permissions.has(PermissionFlagsBits.ManageMessages)) return true;

  // Роль по имени (поменяйте на нужное название или уберите)
  if (message.member.roles.cache.some(r => r.name.toLowerCase() === 'moderator')) return true;

  // Можно считать владельца сервера модератором
  if (message.guild.ownerId === message.author.id) return true;

  return false;
}
