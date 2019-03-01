import { Collection, MessageEmbed, StringResolvable } from 'discord.js';
import { PlayerManager } from 'discord.js-lavalink';
import { Sequelize } from 'sequelize-typescript';
import { Logger } from 'winston';
import Blacklist from '../src/struct/models/blacklist';
import Playlist from '../src/struct/models/playlist';
import Selection from '../src/struct/Selection';

declare module 'discord-akairo' {
  export interface AkairoClient {
    commandHandler: CommandHandler;
    inhibitorHandler: InhibitorHandler;
    listenerHandler: ListenerHandler;
    config: IConfig;
    logger: Logger;
    music: {
      lavalink: PlayerManager;
      queues: Collection<string, UserList>;
    };
    selection: Selection;
    db: {
      sequelize: Sequelize,
      Op: any,
      Playlist: typeof Playlist,
      Blacklist: typeof Blacklist
    }
    dialog(title: string, description?: StringResolvable): MessageEmbed;
    getSongs(keyword: string): Promise<Song[]>;
    getQueue(guildID: string): UserList;
  }
}

export interface IConfig {
  token: string;
  owner: string;
  prefix: string;
  nodes: { host: string, port: number, password: string }[];
  supportLink: string;
  inviteLink: string;
  docs: string;
  emojis: {
    [key: string]: string;
  }
}

export interface Song {
  track: string;
  info: {
    identifier: string;
    isSeekable: boolean;
    author: string;
    length: number;
    isStream: boolean;
    position: number;
    title: string;
    uri: string;
  }
}

export interface UserList {
  user: string;
  current?: Song;
  tracks: Song[];
}
