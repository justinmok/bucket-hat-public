import type { CommandInteraction, GuildMember, VoiceConnection } from "discord.js";
import type { Result } from "ytsr";
import type { BotClient, QueueItem, VideoResult } from '../../../typings/index';
import { getInfo } from 'ytdl-core';

const ytdl = require('ytdl-core-discord');
const ytRegex = /(youtu\.be|youtube\.com)/;
const ytsr = require('ytsr');

const search = (query: string, resultCount: number = 1): Promise<Array<VideoResult>> => {
    console.log(`Searching for ${query}`);
    return new Promise<Array<VideoResult>>(async (resolve, reject) => {
        if (query.match(ytRegex)) resolve([await parseUrl(query)]);
        ytsr.getFilters(query).then(async filters => {
            let filter = await filters.get('Type').get('Video');
            let results: Result = await ytsr(filter.url, {limit: resultCount});

            resolve(<VideoResult[]>results.items);
        })

    });
}

const parseUrl = (query: string): Promise<VideoResult> => {
    return new Promise<VideoResult>(async (resolve, reject) => {
        let videoDetails = await (await getInfo(query)).player_response.videoDetails;
        resolve({
            type: 'video',
            title: videoDetails.title,
            id: videoDetails.videoId,
            url: `https://youtube.com/watch?v=${videoDetails.videoId}`,
            thumbnails: videoDetails.thumbnail.thumbnails,
            duration: videoDetails.lengthSeconds
        } as VideoResult)
    });
}

export const playQueue = async (connection: VoiceConnection, queue: Array<QueueItem>, volume?: number) => {
    if (queue.length == 0) return;
    let stream = await ytdl(queue[0].match.url);

    connection.play(stream, { type: 'opus' })
        .on('finish', () => {
            queue.shift();
            playQueue(connection, queue, volume);
        }).on('error', error => console.error(error));
        
    let currentVolume = connection.dispatcher!.volume;
    if (!volume) volume = currentVolume;
    connection.dispatcher?.setVolume(volume);
    console.log('Now Playing: ', queue[0].match.title)
};

export const processQuery = (interaction: CommandInteraction): Promise<VideoResult> => {
    return new Promise<VideoResult>(async (resolve, reject) => {
        let { musicQueue } = interaction.client as BotClient;
        let query = interaction.options[0].value as string;
        search(query).then(result => {
            let addToQueue: QueueItem = {
            match: result[0],
            query: query,
            requester: interaction.member as GuildMember,
        }
        musicQueue.push(addToQueue);
        resolve(result[0]);
        });
        
    });
};