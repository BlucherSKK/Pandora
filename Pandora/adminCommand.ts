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