import { Listener } from 'discord-akairo';
import { PlayerManager } from 'discord.js-lavalink';

export default class extends Listener {
  constructor () {
    super('ready', {
      emitter: 'client',
      event: 'ready'
    });
  }

  public exec () {
    const me = this.client.user;
    const guildSize = this.client.guilds.size;

    this.client.logger.info(`Logged in as ${me.tag} (ID: ${me.id})`);
    me.setActivity(`@${me.username} help`, { type: 'LISTENING' });

    if (guildSize)
      this.client.logger.info(`Listening to ${guildSize === 1
        ? this.client.guilds.first()
        : `${guildSize} Guilds`}`);
    else this.client.logger.info('Standby Mode');

    this.client.music.lavalink = new PlayerManager(this.client, this.client.config.nodes, {
      user: this.client.user.id,
      shards: this.client.shard ? this.client.shard.count : 0
    });

    for (const [ , node ] of this.client.music.lavalink.nodes)
      node
        .once('ready', () => this.client.logger.info('Connected to Lavalink Server!'))
        .once('disconnect', () => process.exit(0));

    return true;
  }
}
