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

export async function get_log_file(message: Message, member: GuildMember, logfilePath: string) {
    member.send({ 
        embeds: [new EmbedBuilder()
            .setTitle("Вот запрошенные логи.")
            .setColor(BruhFn.COLOR.STD_REQUAST)],
        files: [logfilePath]
        });
}

export async function clear_anime_list(msg: Message, filePath: string): Promise<void> {
    await fs.writeFileSync(filePath, "", 'utf-8');
}


export async function call_debug(msg: Message, host: string, client: Client): Promise<string | void> {

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
            return "Функция не найдена";
    }
}
