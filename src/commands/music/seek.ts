import { Command } from 'discord-akairo';
import { Message } from 'discord.js';
// @ts-ignore
import * as ms from 'ms';
import prettifyMs from '../../util/prettifyMs';
import PlayCommand from './play';

export default class SeekCommand extends Command {
  constructor () {
    super('seek', {
      aliases: [ 'seek' ],
      description: {
        content: [
          'Seeks to a specified time within the song\'s length.',
          'Prioritises Moderators.',
          'Format Examples (* represents a number):',
          '- `*h` hour unit',
          '- `*m` minute unit',
          '- `*s` second unit',
        ],
        usage:  '<time>',
        examples: [ '', '34s', '1m 34s', '3h 34m 2s' ]
      },
      channel: 'guild',
      ratelimit: 1,
      args: [
        {
          id: 'seek',
          type: phrase => {
            if (!phrase) return null;

            const parsed = phrase.split(/ +/g);

            return parsed.every(p => ms(p) !== undefined) ? parsed.reduce((p, c) => p += ms(c), 0) : null;
          },
          match: 'content',
          prompt: {
            start: 'What time would you like to jump to?',
            retry: 'Huh? Try again!'
          }
        },
      ]
    });
  }

  public async exec (message: Message, { seek }: { seek: number }) {
    const playCommand = (this.handler.modules.get('play') as PlayCommand);
    const myQueue = await this.client.getQueue(message.guild.id);
    const resolvedUser = myQueue.user ? await message.guild.members.fetch(myQueue.user) : null;

    if (await playCommand.cannotOverwrite.bind(playCommand, message, resolvedUser)()) return;

    const player = this.client.music.lavalink.get(message.guild.id);

    if (!player)
      return message.util.reply(this.client.dialog('Huh?', 'I don\'t have any song to seek with. Why bother?'));

    if (seek > myQueue.current.info.length || seek < 0)
      return message.util.reply(
        this.client.dialog('Err...', 'If I did that, I could\'ve played the howl of the void...')
      );

    player.seek(seek);

    if (player.paused) player.pause(false);

    return message.util.reply(
      this.client.dialog(`Seeked to ${prettifyMs(seek)}!`, 'Oh well... I hope you still like the song!')
    );
  }
}
