import { Command } from 'discord-akairo';
import { Message } from 'discord.js';
import prettifyMs from '../../util/prettifyMs';

export default class QueueCommand extends Command {
  constructor () {
    super('queue', {
      aliases: [ 'queue', 'q', 'nowplaying', 'np' ],
      description: { content: 'Shows you the current queue and the current song being played.' },
      ratelimit: 2
    });
  }

  public exec (message: Message) {
    const myQueue = this.client.getQueue(message.guild.id);
    const currentSong = this.client.music.lavalink.get(message.guild.id).state as {
      volume: number, position: number, time: number
    };

    const embed = this.client.dialog('Currently on Queue...')
      .setDescription([
        `[**${myQueue.current.info.title}**](${myQueue.current.info.uri}) by **${myQueue.current.info.author}**`,
        `${prettifyMs(currentSong.position)} / ${prettifyMs(myQueue.current.info.length)}`,
      ]);

    myQueue.tracks.forEach((t, i) =>
      embed.addField(
        `${i + 1} - ${t.info.title} by ${t.info.author}`,
        [
          `__Source__: ${t.info.uri}`,
          `__Length__: ${prettifyMs(t.info.length)}`,
        ]
      )
    );

    return message.util.reply(embed);
  }
}
