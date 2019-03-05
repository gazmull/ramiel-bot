import { Command } from 'discord-akairo';
import { Message } from 'discord.js';
import PlayCommand from './play';

export default class PauseCommand extends Command {
  constructor () {
    super('pause', {
      aliases: [ 'pause', 'paws' ],
      description: {
        content: [
          'Pauses the current song.',
          'Prioritises Moderators.',
        ]
      },
      channel: 'guild',
      ratelimit: 1
    });
  }

  public async exec (message: Message) {
    const cannotOverwrite = (this.handler.modules.get('play') as PlayCommand).cannotOverwrite;
    const myQueue = await this.client.getQueue(message.guild.id);
    const resolvedUser = myQueue.user ? await message.guild.members.fetch(myQueue.user) : null;

    if (await cannotOverwrite(this.client, message, resolvedUser)) return;

    const player = this.client.music.lavalink.get(message.guild.id);

    if (!player)
      return message.util.reply(this.client.dialog('Huh?', 'I don\'t have any song to pause. Why bother?'));
    if (player.paused)
      return message.util.reply(this.client.dialog('C-can you not?! It\'s already paused!'));

    player.pause();

    return message.util.reply(this.client.dialog('Paused!', 'Alright, time to go to the toilet!'));
  }
}
