import { Client, GuildMember } from "discord.js";
import { 
    BruhFn,
} from "./Pandora";


export async function call(mod: GuildMember, mes: string): Promise<void> {
    mod.send({
                    embeds: [{
                        title: "Аааахтунг",
                        footer: {
                            text: `${mes}`
                        },
                        color: BruhFn.COLOR.AHTUNG
                    }]
                });
}

export async function get_moder(mod_id: string, client: Client, guild_id: string): Promise<GuildMember | null> {
    
    const guild = await client.guilds.fetch(guild_id);
    
    let member = null;

    try {
        member = await guild.members.fetch(mod_id);
    } catch (error) {
        member = null;
        BruhFn.low.logHandle(error);
    }

    console.log("Админ получен");
    return member;
}