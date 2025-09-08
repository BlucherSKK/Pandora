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

export async function message_command_handler(
    msg: Message,
    log_file: string,
): Promise<void> {
    
    if(!(is_moder_message(msg))){return;}

    switch(msg.content){
        case "_get_logs":
            
    }


    
}

async function get_log_file(message: Message, member: GuildMember, logfilePath: string) {

            if (!(member.permissions.has(PermissionFlagsBits.BanMembers))){ return; }
            if (message.channel instanceof TextChannel) {message.reply("Жди");}

            member.send({ 
                embeds: [new EmbedBuilder()
                    .setTitle("Вот запрошенные логи.")
                    .setColor(BruhFn.COLOR.STD_REQUAST)],
                files: [logfilePath]
                });
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
