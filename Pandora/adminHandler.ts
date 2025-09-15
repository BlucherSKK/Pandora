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
import * as adminCommand from "./adminCommand"

export async function message_command_handler(
    msg: Message,
    log_file: string,
    anime_list_path: string,
    host: string,
    client: Client,
): Promise<void> {
    
    if(!(is_moder_message(msg))){return;}
    if(!(msg.member instanceof GuildMember)){return;}

    switch(msg.content.split(" ")[0]){
        case "_get_logs":
            await adminCommand.get_log_file(msg, msg.member, log_file);
            await msg_reply("Файлы отправлены", true, msg, true, 10);
            return;

        case "_clear_anime_list":
            await adminCommand.clear_anime_list(msg, anime_list_path);
            await msg_reply("Аниме лист очишен", true, msg, true, 10);
            return;

        case "__call_debug":
            if(is_guild_owner(msg)){
                const rep = await adminCommand.call_debug(msg, host, client);
                if(rep){
                    msg_reply(rep, true, msg, true);
                }
            }
            return;
        
        
        default:
            return;
            
    }


    
}

async function msg_reply(
    rep: string, 
    del_msg: boolean,
    msg: Message,
    del_reply: boolean,
    dely_del_rep: number = 10,
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
        }, dely_del_rep * 1000);
    }
    
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

function is_guild_owner(message: Message): boolean {
    if (!message.guild || !message.member) return false; 
    if (message.guild.ownerId === message.author.id) return true;

    return false;
}