import { Command, Listener } from 'discord-akairo';
import { Message } from 'discord.js';

export default class extends Listener {
  constructor () {
    super('error', {
      emitter: 'commandHandler',
      event: 'error'
    });
  }

  public exec (err: Error, message: Message, command: Command) {
   if (command && message) return new this.client.RamielError(message, command, err);
  }
}
