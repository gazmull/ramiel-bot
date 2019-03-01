import { Command } from 'discord-akairo';
import { Message } from 'discord.js';

export default class StopCommand extends Command {
  constructor () {
    super('stop', {
      aliases: [ 'stop', 'stoppu', 'skip' ],
      description: {
        content: 'Stops or skips the current music.'
      },
      channel: 'guild',
      ratelimit: 2
    });
  }

  public async exec (message: Message) {
    const player = this.client.music.lavalink.get(message.guild.id);

    if (!player)
      return message.util.reply(this.client.dialog('Huh?', 'I don\'t have any song to stop. Why bother?'));

    await player.stop();

    return message.util.reply(this.client.dialog('Stoppu!', 'There you go. I stopped it! Yay?'));
  }
}
