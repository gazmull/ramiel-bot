import { Listener } from 'discord-akairo';
import { Message } from 'discord.js';

export default class extends Listener {
  constructor () {
    super('messageInvalid', {
      emitter: 'commandHandler',
      event: 'messageInvalid'
    });
  }

  public async exec (message: Message) {
    const parsed = message.util.parsed;

    if (!message.guild) return;
    if (!parsed) return;
    if (!parsed.prefix || !parsed.afterPrefix || !parsed.alias) return;

    const commandHandler = this.client.commandHandler;
    const command = commandHandler.modules.get('play');
    const args = await command.parse(message, message.util.parsed.afterPrefix);

    return commandHandler.runCommand(message, command, args);
  }
}
