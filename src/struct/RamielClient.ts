import { AkairoClient, CommandHandler, InhibitorHandler, ListenerHandler } from 'discord-akairo';
import { Collection, Message, StringResolvable } from 'discord.js';
import { PlayerManager } from 'discord.js-lavalink';
import fetch from 'node-fetch';
import { URLSearchParams } from 'url';
import { prefix } from '../../auth';
import { GuildQueue, IConfig, LavalinkResponse, Song } from '../../typings';
import { create } from './Database';
import Winston from './Logger';
import RamielError from './RamielError';
import Selection from './Selection';

const db = create();

export default class RamielClient extends AkairoClient {
  constructor (config: IConfig) {
    super({ ownerID: config.owner }, {
      disabledEvents: [
        'TYPING_START',
        'CHANNEL_PINS_UPDATE',
        'GUILD_BAN_ADD',
        'GUILD_BAN_REMOVE',
        'MESSAGE_DELETE',
        'MESSAGE_DELETE_BULK',
        'RESUMED',
        'WEBHOOKS_UPDATE',
      ],
      disableEveryone: true,
      messageCacheLifetime: 300,
      messageCacheMaxSize: 35
    });

    this.config = config;

    this.commandHandler.resolver.addType('music', (phrase: string) => {
      if (!phrase) return null;
      if (phrase.length <= 2) return null;

      return phrase.replace(/<(.+)>/, '$1');
    });
  }

  public commandHandler = new CommandHandler(this, {
    allowMention: true,
    automateCategories: true,
    commandUtil: true,
    commandUtilLifetime: 180e3,
    defaultCooldown: 5e3,
    handleEdits: true,
    defaultPrompt: {
      cancel: (msg: Message) => `${msg.author}, command cancelled.`,
      ended: (msg: Message) => `${msg.author}, command declined.`,
      modifyRetry: (text, msg) => text && `${msg.author}, ${text}\n\nType \`cancel\` to cancel this command.`,
      modifyStart: (text, msg) => text && `${msg.author}, ${text}\n\nType \`cancel\` to cancel this command.`,
      retries: 3,
      time: 30000,
      timeout: (msg: Message) => `${msg.author}, command expired.`
    },
    directory: __dirname + '/../commands',
    prefix: [ prefix, 'ramiel, ' ]
  });

  public inhibitorHandler = new InhibitorHandler(this, {
    automateCategories: true,
    directory: __dirname + '/../inhibitors'
  });

  public listenerHandler = new ListenerHandler(this, {
    automateCategories: true,
    directory: __dirname + '/../listeners'
  });

  public music: { lavalink: PlayerManager, queues: Collection<string, GuildQueue> } = {
    lavalink: null,
    queues: this.util.collection()
  };

  public selection = new Selection(this);

  public RamielError = RamielError;

  public logger = new Winston().logger;

  public build () {
    this.commandHandler
      .useInhibitorHandler(this.inhibitorHandler)
      .useListenerHandler(this.listenerHandler);

    this.listenerHandler.setEmitters({
      commandHandler: this.commandHandler,
      inhibitorHandler: this.inhibitorHandler,
      listenerHandler: this.listenerHandler
    });

    this.listenerHandler.loadAll();
    this.commandHandler.loadAll();
    this.inhibitorHandler.loadAll();

    return this;
  }

  public async init () {
    const force = [ '-f', '--force' ].some(f => process.argv.includes(f));

    if (force) this.logger.info('Forced sync detected.');

    await db.sequelize.sync({ force });
    this.logger.info('Database synchronised!');

    return this.login(this.config.token);
  }

  public dialog (title: string, description: StringResolvable = '') {
    return this.util.embed()
      .setColor(0xFE9257)
      .setTitle(title)
      .setDescription(description);
  }

  public async getSongs (keyword: string): Promise<LavalinkResponse | Song[]> {
    const node = this.music.lavalink.nodes.first();
    const params = new URLSearchParams();
    const isHttp = /^https?:\/\//.test(keyword);
    keyword = isHttp ? keyword : `ytsearch: ${keyword}`;

    params.append('identifier', keyword);

    try {
      const res = await fetch(
        `http://${node.host}:${node.port}/loadtracks?${params.toString()}`,
        { headers: { Authorization: node.password } }
      );
      const json = await res.json();

      switch (json.loadType) {
        case 'NO_MATCHES':
        case 'LOAD_FAILED': return [ ];
        case 'PLAYLIST_LOADED': {
          const selected = json.playlistInfo.selectedTrack;

          if (selected !== -1)
            return [ json.tracks[selected] ];

          json.tracks = json.tracks.slice(0, 200);

          return json as LavalinkResponse;
        }
        case 'TRACK_LOADED': return [ json.tracks[0] ];
        default: return json.tracks.slice(0, 10);
      }
    }
    catch (err) {
      this.logger.error(err);

      return [];
    }
  }

  public async getQueue (guildID: string) {
    const queue = () => this.music.queues.get(guildID);

    if (!queue()) {
      const remoteQueue = await this.db.Queue.findOne({ where: { guild: guildID } });
      const values: GuildQueue = {
        tracks: remoteQueue ? remoteQueue.tracks : [ ],
        current: remoteQueue ? remoteQueue.current : null,
        user: remoteQueue ? remoteQueue.user : null,
        channel: remoteQueue ? remoteQueue.channel : null,
        textChannel: remoteQueue ? remoteQueue.textChannel : { id: null, message: null },
        host: remoteQueue ? remoteQueue.host : null
      };

      await this.setQueue(guildID, values);
    }

    return queue();
  }

  public async setQueue (guildID: string, values: GuildQueue) {
    await this.db.Queue.upsert({
      guild: guildID,
      channel: values.channel,
      user: values.user,
      current: values.current,
      tracks: values.tracks
    });
    this.music.queues.set(guildID, values);

    return this.getQueue(guildID);
  }

  public async deleteQueue (guildID: string, paranoid = true) {
    if (!paranoid) await this.music.lavalink.leave(guildID);

    await this.db.Queue.destroy({ where: { guild: guildID } });

    return this.music.queues.delete(guildID);
  }

  get db () {
    return db;
  }
}
