import { Command, Inhibitor } from 'discord-akairo';
import { Message } from 'discord.js';

export default class MusicInhibitor extends Inhibitor {
  constructor () {
    super('music', { reason: 'music' });
  }

  public exec (message: Message, command: Command) {
    return command.categoryID === 'music' &&
      [ 'destroy', 'pause', 'play', 'resume', 'seek', 'stop', 'volume' ].includes(command.id) &&
      (!message.member.voice || !message.member.voice.channel);
  }
}
