import { Command, Listener } from 'discord-akairo';
import { Message } from 'discord.js';

export default class extends Listener {
  constructor () {
    super('commandLocked', {
      emitter: 'commandHandler',
      event: 'commandLocked'
    });
  }

  public exec (message: Message, command: Command) {
    const userBased = [
      'You have an existing command that is waiting for you to respond.',
      'If you wish to continue with a new command, please say `cancel` first!',
    ];
    const defaultBased = [
      `Looks like this command is currently being used in this channel.`,
      'Please try again later!',
    ];

    return message.util.reply(
      this.client.dialog(
        'Command Locked!',
        command.lock(message, null) === message.author.id ? userBased : defaultBased
      )
    );
  }
}
