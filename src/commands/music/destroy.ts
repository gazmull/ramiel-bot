import { Command } from 'discord-akairo';
import { Message } from 'discord.js';

export default class DestroyCommand extends Command {
  constructor () {
    super('destroy', {
      aliases: [ 'destroy' ],
      description: { content: 'Destroys the current queue.' },
      ratelimit: 1
    });
  }

  public async exec (message: Message) {
    await this.client.music.lavalink.leave(message.guild.id);
    this.client.music.queues.delete(message.guild.id);

    return message.channel.send(
      this.client.dialog('Left... successfully...?')
    );
  }
}
