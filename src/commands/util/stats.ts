import { Command, version as akairoVersion } from 'discord-akairo';
import { Message, version as discordVersion } from 'discord.js';
import { version as lavalinkVersion } from 'discord.js-lavalink';
import * as os from 'os';
// @ts-ignore
import { description, private as privateBot, repository, version as ramielVersion } from '../../../package.json';
import prettifyMs from '../../util/prettifyMs';

export default class extends Command {
  constructor () {
    super('stats', {
      aliases: [ 'stats', 'status', 'about', 'aboutme' ],
      description: { content: 'Displays my information.' }
    });
  }

  public async exec (message: Message) {
    const { docs } = this.client.config;
    const _description = [
      description,
      '',
      `[**Source Code**](${repository}) | [**Bot Documentation**](${docs})`,
    ];

    return message.util.send(
      this.client.dialog(null)
        .setTitle('Ramiel')
        .setDescription(_description)
        .setThumbnail(this.client.user.displayAvatarURL({ format: 'webp', size: 128 }))
        .setImage(`${repository}/blob/master/ramieru.png?raw=true`)
        .addField('Author', this.client.users.get(this.client.ownerID as string), true)
        .addField('Libraries and Applications', [
          `**Discord.JS**: v${discordVersion}`,
          `**Akairo**: v${akairoVersion}`,
          `**Lavalink Client**: v${lavalinkVersion}`,
          `**Ramiel**: v${ramielVersion} ${privateBot ? '(Private Bot)' : ''}`,
        ], true)
        .addField('Discord', [
          `**Servers**: ${this.client.guilds.size} (${this.client.music.queues.size} uses music)`,
          `**Channels**: ${this.client.channels.size}`,
          `**Users**: ${this.client.users.size}`,
        ], true)
        .addField('System', [
          `**Uptime**: ${prettifyMs(this.client.uptime)}`,
          `**Memory**: ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB`,
          `**NodeJS**: ${process.version}`,
          `**OS**: ${os.type()} ${os.arch()}`,
        ], true)
    );
  }
}
