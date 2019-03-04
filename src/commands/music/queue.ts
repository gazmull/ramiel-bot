import { Command } from 'discord-akairo';
import { FieldsEmbed } from 'discord-paginationembed';
import { Message } from 'discord.js';
import { Song } from '../../../typings';
import prettifyMs from '../../util/prettifyMs';

export default class QueueCommand extends Command {
  constructor () {
    super('queue', {
      aliases: [ 'queue', 'q', 'nowplaying', 'np' ],
      description: { content: 'Shows you the current queue and the current song being played.' },
      ratelimit: 1,
      channel: 'guild',
      args: [
        {
          id: 'page',
          type: 'integer',
          default: 1
        },
      ]
    });
  }

  public exec (message: Message, { page }: { page: number }) {
    const myQueue = this.client.getQueue(message.guild.id);
    const currentSong = this.client.music.lavalink.get(message.guild.id);

    if (!currentSong || !myQueue.current)
      return message.util.reply(this.client.dialog('I got nothing on queue, baby\~\~ nothing on queue, baby\~!'));

    const isNothing = myQueue.tracks.length
      ? myQueue.tracks
      : [ {
        info: {
          title: 'Nothing to play here',
          uri: 'http://erosdev.thegzm.space',
          author: 'Ramiel',
          length: 817000
        }
      } ];
    const embed = new FieldsEmbed()
      .setTitle('Now Playing...')
      .setDescription([
        `[**${myQueue.current.info.title}**](${myQueue.current.info.uri}) by **${myQueue.current.info.author}**`,
        `${prettifyMs((currentSong.state as any).position)} / ${prettifyMs(myQueue.current.info.length)}`,
        `To skip to a song, say \`${this.client.config.prefix}skip <song number>\``,
      ])
      .setColor(0xFE9257)
      .setArray(isNothing)
      .setAuthorizedUsers([ message.author.id ])
      .setChannel(message.channel)
      .setElementsPerPage(5)
      .setPage(page)
      .showPageIndicator(true)
      .formatField(
        '# - Song',
        (t: Song) =>
          // tslint:disable-next-line:max-line-length
          `**${isNothing.indexOf(t) + 1}** - [**${t.info.title}**](${t.info.uri}) by ${t.info.author} (${prettifyMs(t.info.length)})`
      );

    return embed.build();
  }
}
