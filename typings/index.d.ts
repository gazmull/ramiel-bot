import { CommandHandler, InhibitorHandler, ListenerHandler } from 'discord-akairo';
import { Collection, MessageEmbed, StringResolvable } from 'discord.js';
import { PlayerManager } from 'discord.js-lavalink';
import { Sequelize } from 'sequelize-typescript';
import { Logger } from 'winston';
import Blacklist from '../src/struct/models/Blacklist';
import Moderator from '../src/struct/models/Moderator';
import Playlist from '../src/struct/models/Playlist';
import Queue from '../src/struct/models/Queue';
import RamielError from '../src/struct/RamielError';
import Selection from '../src/struct/Selection';

interface RamielClient {
  commandHandler: CommandHandler;
  inhibitorHandler: InhibitorHandler;
  listenerHandler: ListenerHandler;
  config: IConfig;
  logger: Logger;
  music: {
    lavalink: PlayerManager;
    queues: Collection<string, GuildQueue>;
  };
  selection: Selection;
  RamielError: typeof RamielError;
  db: {
    sequelize: Sequelize,
    Op: Sequelize['Op'],
    Playlist: typeof Playlist,
    Blacklist: typeof Blacklist,
    Moderator: typeof Moderator,
    Queue: typeof Queue,
  }
  dialog(title: string, description?: StringResolvable): MessageEmbed;
  getSongs(keyword: string): Promise<LavalinkResponse | Song[]>;
  getQueue(guildID: string): Promise<GuildQueue>;
  setQueue(guildID: string, values: GuildQueue): Promise<GuildQueue>;
  deleteQueue(guildID: string, paranoid?: boolean): Promise<boolean>;
}

declare module 'discord-akairo' {
  export interface AkairoClient extends RamielClient { }
}

declare module 'discord.js' {
  export interface Client extends RamielClient { }
}

export interface IConfig {
  token: string;
  owner: string;
  prefix: string;
  nodes: { host: string, port: number, password: string }[];
  db: { host: string, database: string, username: string, password: string }
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

export interface LavalinkResponse {
  loadType?: 'TRACK_LOADED' | 'PLAYLIST_LOADED' | 'SEARCH_RESULT' | 'NO_MATCHES' | 'LOAD_FAILED';
  playlistInfo?: {
    name: string;
    selectedTrack: number;
  };
  tracks?: Song[]
}

export interface GuildQueue {
  host: string;
  user: string;
  channel: string;
  textChannel: {
    id: string;
    message: string;
  };
  current?: Song;
  tracks: Song[];
}
