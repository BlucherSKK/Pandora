import * as fs from "node:fs"
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
    ButtonBuilder,
    ButtonStyle,
    ActionRowBuilder} from 'discord.js';
import type { Channel, PartialGuildMember, GuildBasedChannel, REST, ChatInputCommandInteraction, InteractionReplyOptions, InteractionResponse, MessageCreateOptions, ButtonInteraction } from 'discord.js';
import { BruhFn } from "./Pandora";

export class BruhPlaer
{
    public author: GuildMember | null;
    public playlist: string[];
    public state: BruhPlaerState;
    public channle: Channel | null;
    public curently_trek: number | null;
    public ui_message: Message | null;

    constructor()
    {
        this.author = null;
        this.curently_trek = null;
        this.playlist = [];
        this.state = BruhPlaerState.Authorless;
        this.channle = null;
        this.ui_message = null;
    }

    public init(member: GuildMember, channel1: Channel, message: Message) 
    {
        this.author = member;
        this.state = BruhPlaerState.Wait;
        this.channle = channel1;
        this.ui_message = message;
    }

    public is_init(): boolean
    {
        return this.author !== null;
    }
}

export enum BruhPlaerState
{
    Loading,
    Plaing,
    Pause,
    Wait,
    Authorless
}

export namespace BruhMusic
{
    export enum BUTTON
    {
        Back,
        Scip,
        Pause,
        Play
    }
    export function button_builder(button_type: BUTTON) 
    {
        let custom_id: string;
        let icon: string;

        switch(button_type){
            case BUTTON.Back:
                {
                    custom_id = 'music_back';
                    icon = '⏮️';
                }
                break;
            case BUTTON.Pause:
                {
                    custom_id = 'music_pause';
                    icon = '⏸️';
                }
                break;
            case BUTTON.Play:
                {
                    custom_id = 'music_play';
                    icon = '▶️';
                }
                break;
            case BUTTON.Scip:
                {
                    custom_id = 'music_scip';
                    icon = '⏭️';
                }
                break;
            default:
                {
                    custom_id = 'underfind_button';
                    icon = 'n';
                }
        }
        const button = new ButtonBuilder()
            .setCustomId(custom_id)
            .setEmoji(icon)
            .setStyle(ButtonStyle.Primary)

        return button;
    }

    export namespace interact
    {
        export async function plaer_up(interact: ChatInputCommandInteraction, plaer: BruhPlaer) 
        {
            const { member, commandName, channel } = interact;

            if (commandName !== "plaer_up") { return; }
            if (!(channel instanceof TextChannel)) { return; } 
            
            interact.reply("Ща");

            const row = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(button_builder(BUTTON.Back), button_builder(BUTTON.Pause), button_builder(BUTTON.Play), button_builder(BUTTON.Scip));

            const ui_message = await channel.send({
                content: 'Плеер активирован',
                components: [row],
            })

            plaer.init(member as GuildMember, channel, ui_message);
        }

        export async function add_to_playlist(interact: ChatInputCommandInteraction, plaer: BruhPlaer) 
        {
            if(!(plaer.is_init())){return BruhFn.low.send_deletable_reply(interact, "Плаер ещё не инициализирован, используй /plaer_up");}
            const { member, commandName, channel } = interact;

            if (commandName !== "add_music") { return; }
            if (!(channel instanceof TextChannel)) { return; }
            
            const trek = interact.options.getString("URL") as string;

            plaer.playlist.push(trek);
            
            interact.reply("")
        }
    }
    export namespace button_interact
    {
        export async function handle_plaer_actions(interact: ButtonInteraction, plaer: BruhPlaer) 
        {
            if(plaer.state == BruhPlaerState.Authorless){return;}    

            const {member, customId} = interact;

            if((member !== plaer.author) || (!(member?.permissions.has(PermissionsBitField.StageModerator)))){return;}

            switch(customId)
            {
                case 'music_back':

            }



        }
    }
}