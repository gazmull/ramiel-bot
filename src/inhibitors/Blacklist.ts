import { Inhibitor } from 'discord-akairo';
import { Message } from 'discord.js';

export default class MusicInhibitor extends Inhibitor {
  constructor () {
    super('blacklist', { reason: 'blacklist', type: 'all' });
  }

  public async exec (message: Message) {
    return Boolean(await this.client.db.Blacklist.findOne({ where: { user: message.author.id } }));
  }
}
