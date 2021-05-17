import type * as Discord from 'discord.js';
import type * as ytsr from "ytsr";

interface BotClient extends Discord.Client {
    commands: Map<string, DiscordCommand>,
    musicQueue: MusicQueue,
    cloudProjectId?: string,
    channelTimeout: NodeJS.Timeout | null;
}

interface BotConfig {
    token: string,
    testToken: string,
}

interface VideoResult extends Omit<ytsr.Video, 'bestThumbnail' | 'author' | 'isUpcoming' | 'views' |'isLive' | 'badges' | 'isComing' | 'upcoming' | 'uploadedAt' | 'description'> {
    
}

interface QueueItem {
    match: VideoResult,
    query: string,
    requester: Discord.GuildMember
}

type MusicQueue = Array<QueueItem>;

interface embed {
    name: string,
    createEmbed(...args): Discord.MessageEmbed;
}

interface DiscordCommand extends Discord.ApplicationCommand {
    category: 'Admin' | 'General' | 'Music' | 'Experimental',
    execute(...args): any
}

interface MinecraftResponse {
    description: {
        text: string
    },
    players: {
        max: number,
        online: number,
        sample?: [ name: string, id: string ]
    }
    version: {
        name: string,
        protocol: number,
    }
    favicon?: string,
    ping: number,
}

type BotCommands = Discord.Collection<string, DiscordCommand>;

interface geminiResponse {
    symbol: string,
    open: string,
    high: string,
    low: string,
    close: string,
    changes: string[],
    bid: string,
    ask: string,
}

interface cryptoInfo extends geminiResponse{
    exchange: string,
    fiat: string,
    ticker: string,
}
