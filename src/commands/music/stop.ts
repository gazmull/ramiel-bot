import { Command } from 'discord-akairo';
import { Message } from 'discord.js';
import PlayCommand from './play';

export default class StopCommand extends Command {
  constructor () {
    super('stop', {
      aliases: [ 'stop', 'stoppu', 'skip' ],
      description: {
        content: [
          'Stops or skips the current music.',
          'Appending a number will skip to the song from the numbered queue.',
          'Prioritises Moderators.',
        ],
        usage:  '[queue number]',
        examples: [ '', '7' ]
      },
      channel: 'guild',
      ratelimit: 1,
      args: [
        {
          id: 'skip',
          type: 'integer'
        },
      ]
    });
  }

  public async exec (message: Message, { skip }: { skip: number }) {
    const cannotOverwrite = (this.handler.modules.get('play') as PlayCommand).cannotOverwrite;
    const hasPlaylist = this.client.getQueue(message.guild.id).user;
    const resolvedUser = hasPlaylist ? await message.guild.members.fetch(hasPlaylist) : null;

    if (await cannotOverwrite(this.client, message, resolvedUser)) return;

    const player = this.client.music.lavalink.get(message.guild.id);

    if (!player)
      return message.util.reply(this.client.dialog('Huh?', 'I don\'t have any song to stop. Why bother?'));
    if (skip) {
      const myQueue = this.client.getQueue(message.guild.id);

      if (skip > myQueue.tracks.length || skip <= 0)
        return message.util.reply(this.client.dialog('Err...', 'There is no song in that queue number...'));

      myQueue.tracks.splice(0, skip - 1);
      this.client.music.queues.set(message.guild.id, myQueue);
    }

    await player.stop();

    if (skip)
      return message.util.reply(this.client.dialog('Skipped!', 'That was tiring... but here you go!'));

    return message.util.reply(this.client.dialog('Stoppu!', 'There you go. I stopped it! Yay?'));
  }
}
