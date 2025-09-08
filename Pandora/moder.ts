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
    time} from 'discord.js';
import type { 
    Channel, 
    PartialGuildMember, 
    GuildBasedChannel, 
    REST, 
    ChatInputCommandInteraction, 
    InteractionReplyOptions, 
    InteractionResponse, 
    MessageCreateOptions } from 'discord.js';
import {
    BruhFn,
    ADMIN_CALLABLE_ID,
} from "./Pandora";
import * as Note from "./note";
import {
    sleep
} from "./HttpGiver";

const ACCESEPTABLE_DOMENS = [
    "tenor.com"
];

async function no_no_mr_fish(message: Message, requast: string): Promise<void> {
    let rely_msg = await message.reply(
        `Но но но мистер фиш\n\
        ${requast}\n\
        :neuron_activason:`
    );
    message.delete();
    await sleep(15);
    rely_msg.delete();

}

function check_acceseptable_domen(url: string): boolean {
    if(url.length < 3){return true;}

    const domen = url.split('/')[2];
    for(const pat of ACCESEPTABLE_DOMENS){
        if(pat == domen){return true;}
    }
    return false;
}


export async function chek_acceptable_message(
    message: Message, 
    queue: ModerQueue, 
    admin: GuildMember): Promise<void> {

    console.log(`edetect ${message.content}`);

    let content = message.content;
    const ping_patrn = /@everyone/;
    const url_patrn = /https?:\/\/[^\s]+/g;


    if(content.match(ping_patrn)){
        await no_no_mr_fish(message, "никаких пингов");
    } else {
        if(content.match(url_patrn)){
            let path = content.match(url_patrn)?.[0];
            if(!(check_acceseptable_domen(path as string))){
                await no_no_mr_fish(message, "это недопустимая ссылка");
                return;
            };
        }
        await queue.push(message, admin);
    }

    return;

};

export class ModerQueue {
    private queues: MemeberrQueue[] = [];
    private busy: boolean = false;

    public async push(message: Message, ADMIN_OB: GuildMember): Promise<void> {
        while(this.busy){}
        this.busy = true;

        let mem_index = 0;
        for(const mem of this.queues){
            if(mem.author.id == message.author.id){
                for(const mem_content of mem.queue){
                    if(mem_content.content == message.content){
                        await mem.sin_increment();
                        if(mem.sinCounter > 2){
                            await mem.fu_handler(ADMIN_OB);
                            this.queues.splice(mem_index, 1);
                        }
                    } else {
                        await mem.push(message);
                    }
                }
                this.busy = false;
                return;
            }
            mem_index++;
        }

        if(!(message.author instanceof GuildMember)){return;}

        let new_mem = new MemeberrQueue(message.author);
        new_mem.push(message);
        this.queues.push(new_mem);

        this.busy = false;
        return;

    }
}


class MemeberrQueue {
    public author: GuildMember;
    public sinCounter: number = 0;
    public queue: Message[] = [];
    private busy: boolean = false;
    private date: Date;

    constructor(author: GuildMember){
        this.author = author;
        this.date = new Date;
    }

    public async sin_increment(): Promise<void> {
        while(this.busy){}
        this.busy = true;
        this.sinCounter++;
        this.busy = false;
        return;
    }

    public async push(str: Message): Promise<void> {
        while(this.busy){}
        this.busy = true;
        this.queue.push(str);
        this.busy = false;
        return;
    }

    public async fu_handler(ADMIN_OB: GuildMember): Promise<void> {
        while(this.busy){}
        this.busy = true;
    
        if(BruhFn.low.isModerator(this.author)){return;}

        for(const mes of this.queue){
            await mes.delete();
        }

        this.author.timeout(15*60*1000, "похоже что автомод решил что вы спамите, \
            если это не так, пожалуйста, обратитесь к модераторам")

        this.busy = false;
        Note.call(ADMIN_OB, `чел хуйню творит ${this.author}`)
        return;
    }
        
}