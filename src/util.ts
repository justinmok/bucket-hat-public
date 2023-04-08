import { Firestore } from '@google-cloud/firestore';
import { request } from 'gaxios';
import fs = require('fs');

import type { BotConfig, DiscordCommand, geminiResponse, cryptoInfo } from '../typings/index.js';
import { Collection } from 'discord.js';

const db = new Firestore({
    projectId: 'keylimepie',
    keyFilename: '../gcloudauth.json'
});

const serverConfigs = db.doc('config/by_server').collection('server');

export const queryConfig = (): Promise<BotConfig> => {
    return new Promise<BotConfig>((resolve, reject) => {
        db.doc('config/global').get().then((ret) => {
            let fetchedConfig = ret.data();
            if (!fetchedConfig) reject('Can\'t get config');
            resolve({
                token: fetchedConfig?.token,
                testToken: fetchedConfig?.testToken,
            });
        });
    });
}

export const getVolume = (serverId: string): Promise<number> => {
    return new Promise<number>((resolve, reject) => {
        serverConfigs.doc(serverId.toString()).get().then(config => {
            if (!(config.data())) reject('vol_not_set');
            else resolve(config.data()!.volume);
        })
    });
}

export const updateVolume = (serverId: string, volume: number) => {
    serverConfigs.doc(serverId).update({'volume': volume}).catch(e => { throw e });
}

export const getCommands = (): Promise<Collection<string, DiscordCommand>> => {
    let commandsCollection: Collection<string, DiscordCommand> = new Collection();
    return new Promise<Collection<string, DiscordCommand>>((resolve, reject) => {
        let commandsFolder = fs.readdirSync('./commands').filter(dir => !dir.includes('utils'));
        for (const folder of commandsFolder) {
            const commandFiles = fs.readdirSync(`./commands/${folder}`).filter(file => file.endsWith('.js'));
            for (const file of commandFiles) {
                import(`./commands/${folder}/${file}`).then((imported: DiscordCommand) => {
                    commandsCollection.set(imported.toJSON().name, imported);
                });
                
            }
        }
        resolve(commandsCollection);
    });
}

export const queryCrypto = (ticker: string, base: string = 'USD'): Promise<cryptoInfo> => {
    return new Promise<cryptoInfo>((resolve, reject) => {
        request({
            url: `https://api.gemini.com/v2/ticker/${ticker}${base}`
        }).then(res => {
            if (res.status != 200) reject('Request failed');
            let data = res.data as geminiResponse;
            resolve({...data, exchange: 'Gemini', fiat: base.toUpperCase(), ticker: ticker.toUpperCase()})
        }).catch(e => reject(e));
    });
};