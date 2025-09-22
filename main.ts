
import { Client, GatewayIntentBits, GuildMember, Message, TextChannel, REST, Routes, SlashCommandBuilder } from 'discord.js';
import type { ChatInputCommandInteraction, PartialGuildMember } from 'discord.js'
import makeWelcome from './Pandora/makeWelcome.tsx';
import { TOKEN } from './test.json';
import cron from 'node-cron';
import parser from 'cron-parser';
import * as ini from "ini";
import * as fs from 'fs';
import { BruhFn } from './Pandora/Pandora.ts';
import { channel } from 'diagnostics_channel';
import { error } from 'console';
import { files_io } from './Pandora/parsing.ts';
import { deserialize } from 'v8';
import https from "http";
import path from 'path';
import {BruhMusic, BruhPlaer, BruhPlaerState} from './Pandora/musicPlaer.ts';
import { get_moder } from './Pandora/note.ts';
import { message_command_handler } from "./Pandora/adminHandler.ts";


const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.AutoModerationConfiguration,
        GatewayIntentBits.MessageContent, 
        GatewayIntentBits.GuildMembers,
    ],
});
let Plaer = new BruhPlaer();
const MAIN_CONFIG_CONTENT = fs.readFileSync("test.ini", "utf-8");
const BRUH_ID = files_io.ini_get_config_value(MAIN_CONFIG_CONTENT, "bruh info", "ID")[0]; 
const GUILD_ID = files_io.ini_get_config_value(MAIN_CONFIG_CONTENT, "bruh info", "SERVER")[0];  
let UP_TIME = 0;
const ADMIN_CHANNEL_ID = files_io.ini_get_config_value(MAIN_CONFIG_CONTENT, "Channels", "Admin")[0];
const SAVEABLE_CHANLES_IDS = files_io.ini_get_config_value(MAIN_CONFIG_CONTENT, "Channels", "Saveable");
const HENTAI_DIR = "./hentaiStaff";
const HOST = files_io.ini_get_config_value(MAIN_CONFIG_CONTENT, "bruh info", "HOST")[0];
const rest = new REST({ version: '9' }).setToken(TOKEN);
const WELKOM_ID = files_io.ini_get_config_value(MAIN_CONFIG_CONTENT, "Channels", "WELKOM")[0];
const ANIME_LIST = "assets/anime.txt";
const TMP_DIR = "./tmp";
const LOGS = "./bruh.log";
let last_pivo_msg;

/*
    STRING (тип 3): Строка. Используется для текстовых вводов.
    INTEGER (тип 4): Целое число. Используется для числовых вводов.
    BOOLEAN (тип 5): Логическое значение (true/false).
    USER (тип 6): Упоминание пользователя. Позволяет выбрать пользователя из сервера.
    CHANNEL (тип 7): Упоминание канала. Позволяет выбрать канал из сервера.
    ROLE (тип 8): Упоминание роли. Позволяет выбрать роль из сервера.
    MENTIONABLE (тип 9): Упоминание пользователя или канала. Позволяет упоминать как пользователей, так и каналы.
ц  */
export enum OptionsTypes{
    STRING = 3,
    INTEGER,
    BOOLEAN, 
    USER,
    CHANNEL,
    ROLE,
    MENTIONABLE,
}

const COMMANDS = [
    {
        name: 'info',
        description: 'информация о боте',
    },
    {
        name: "admin_get_logs",
        description: "отправляет файл с логами в личку"
    },
    {
        name: "anime_list",
        description: "показывает список из которого рандомайзится аниме",
    },
    /*{
        name: "plaer_up",
        description: "создаёт интерфейс для воспроизведения музыки в канале вызова",
    },*/
    {
        name: 'add_anime_to_bank',
        description: "добовляет аниме в список для рандомайзинга",
        options: [
            {
                name: "anime",
                description: "можно несколько через ;",
                type: OptionsTypes.STRING,
                required: true,
            }
        ]
    },
    {
        name: 'admin_clear',
        description: '<только дл ямодеров> очистка сообшений из канала',
        options: [
            {
                name: 'quantity',
                description: 'Количество сообшений для удаления',
                type: 4, // 3 соответствует строковому типу
                required: true,
            },
        ],
    },
    {
        name: "random_anime",
        description: "бот выберет рандомное аниме для вас из файла(txt) на сервере",
    },
    {
        name: "when_friday",
        description: "...",
    },
    {
        name: "admin_clear_anime_list",
        description: "Очишает лист аниме полностью"
    },
    {
        name: "admin_call_debug",
        description: "call function now",
        options: [
            {
                name: 'name',
                description: "function name",
                type: 3,
                required: true,
            }
        ]
    },
    {
        name: "pull_channle_info",
        description: "даёт информацию о канале",
        options:[
            {
                name: "target",
                description: "целевой канала",
                type: OptionsTypes.CHANNEL,
                required: true
            }
        ]
    },
    {
        name: "admin_merge_channles",
        description: "выполняет слияне всех вложений из одного канала в другой канала",
        options: [
            {
                name: "from",
                description: "source channle",
                type: OptionsTypes.CHANNEL,
                required: true,
            },
            {
                name: "to",
                description: "target channle",
                type: OptionsTypes.CHANNEL,
                required: true,
            }
        ]
    },
    {
        name: "admin_save_from_date",
        description: "<только для админов> сохроняет все арты за опеределённый перюд",
        options: [
            {
                name: 'yys',
                description: 'start year',
                type: 4, 
                required: true,
            },
            {
                name: 'mms',
                description: 'start month',
                type: 4, 
                required: true,
            },
            {
                name: 'dds',
                description: 'start day',
                type: 4, 
                required: true,
            },
            {
                name: 'yye',
                description: 'end year',
                type: 4, 
                required: true,
            },
            {
                name: 'mme',
                description: 'end month',
                type: 4, 
                required: true,
            },
            {
                name: 'dde',
                description: 'end day',
                type: 4, 
                required: true,
            },
        ]
    }
];

BruhFn.regist_commands(COMMANDS, rest, BRUH_ID, GUILD_ID);

//let ADMIN: GuildMember;

client.on('ready', async () => {

    //ADMIN = await get_moder('657872729126469642', client, GUILD_ID) as GuildMember;

    BruhFn.setFrideyScheduler(
        client,
        '1251045085085175909',
        'А вот и пятница мои shikikanы!',
        './assets/za_pivom.gif',
        "0 0 10 * * 5",
        last_pivo_msg,
    );

    BruhFn.send_schedule_report(
        HENTAI_DIR,
        "0 0 18 * * 5",
        3*24*3600,
        HOST,
        client.channels.cache.get(ADMIN_CHANNEL_ID) as TextChannel,
        client,
    );

    if (client.user) {
        console.log(`Бот - ${client.user.tag} запущен!`);
    };
});


client.on("messageCreate", (message) => {
    BruhFn.AutoArtSaver(client, SAVEABLE_CHANLES_IDS, HENTAI_DIR, message);

    message_command_handler(message, LOGS, ANIME_LIST, HOST, client, SAVEABLE_CHANLES_IDS, HENTAI_DIR);

});

client.on('guildMemberAdd', async (member: GuildMember) => {
    BruhFn.MemberHandler.NewMember(member, WELKOM_ID);
});

client.on('guildMemberRemove', async (member: GuildMember | PartialGuildMember) => {
    BruhFn.MemberHandler.LeaveMember(member, ADMIN_CHANNEL_ID);
});

client.on('interactionCreate', async (interaction) => {

    if(interaction.isCommand())
    {
        BruhFn.interect.Info(interaction as ChatInputCommandInteraction, UP_TIME);

        BruhFn.interect.getTimeUntilFriday(interaction as ChatInputCommandInteraction);

        BruhFn.interect.random_anime_from_txt(interaction as ChatInputCommandInteraction, ANIME_LIST);

        BruhFn.interect.add_anime(interaction as ChatInputCommandInteraction, ANIME_LIST);

        BruhFn.interect.show_anime_list(interaction as ChatInputCommandInteraction, ANIME_LIST);

    }
    
    
});

// Запуск бота
client.login(TOKEN);

setInterval( () => {
    UP_TIME += 1;
}, 3_600_000);
