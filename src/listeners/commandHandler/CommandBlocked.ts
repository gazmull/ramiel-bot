import { Listener } from 'discord-akairo';
import { Message } from 'discord.js';

export default class extends Listener {
  constructor () {
    super('commandBlocked', {
      emitter: 'commandHandler',
      event: 'commandBlocked'
    });
  }

  public exec (message: Message, _, reason: string) {
    if (reason === 'music')
      return message.util.reply(
        this.client.dialog(
          'Command Blocked!',
          `You should be in a voice channel to use **${message.util.parsed.alias}** command!`
        )
      );
  }
}
