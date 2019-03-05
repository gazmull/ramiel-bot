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

    for (const [ k, node ] of this.client.music.lavalink.nodes)
      node
        .on('ready', async () => {
          this.client.logger.info(`${k} Connected to Lavalink Server!`);

          const guilds = this.client.music.queues;

          if (!guilds.size) return;

          for (const [ id, v ] of guilds) {
            const lavalink = await this.client.music.lavalink.join({
              guild: id,
              channel: v.channel,
              host: node.host
            }, { selfdeaf: true });

            lavalink.play(v.current.track);
          }

          this.client.logger.info(`${k} Reconnected to previously active players.`);
        })
        .on('reconnecting', () => this.client.logger.warn(`${k} Reconnecting to Lavalink Server...`))
        .on('disconnect', inf => this.client.logger.warn(`${k} Disconnected: ${inf}`));

    return true;
  }
}
