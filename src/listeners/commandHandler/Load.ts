import { Command, Listener } from 'discord-akairo';

export default class extends Listener {
  constructor () {
    super('load', {
      emitter: 'commandHandler',
      event: 'load'
    });
  }

  public exec (command: Command) {
    const perms = [
      'ADD_REACTIONS',
      'EMBED_LINKS',
      'MANAGE_MESSAGES',
      'SEND_MESSAGES',
      'USE_EXTERNAL_EMOJIS',
      'VIEW_CHANNEL',
    ];
    const cp = command.clientPermissions as string[];

    if (cp)
      Object.assign(command, { clientPermissions: cp.concat(perms) });
    else
      Object.assign(command, { clientPermissions: perms });
  }
}
