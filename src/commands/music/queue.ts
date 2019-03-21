import { Command } from 'discord-akairo';
import { FieldsEmbed } from 'discord-paginationembed';
import { Message } from 'discord.js';
import { Song } from '../../../typings';
import prettifyMs from '../../util/prettifyMs';

const NOTHING = {
  info: {
    title: 'Nothing to play here',
    uri: 'http://erosdev.thegzm.space',
    author: 'Ramiel',
    length: 817000
  }
};

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

  public async exec (message: Message, { page }: { page: number }) {
    const myQueue = await this.client.getQueue(message.guild.id);
    const currentSong = this.client.music.lavalink.get(message.guild.id);

    if (!myQueue.current && !myQueue.tracks.length) {
      await this.client.deleteQueue(message.guild.id, false);

      return message.util.reply(this.client.dialog('I got nothing on queue, baby\~\~ nothing on queue, baby\~!'));
    }

    const isCurrentNothing = myQueue.current ? myQueue.current : NOTHING;
    const areTracksNothing = myQueue.tracks.length ? myQueue.tracks : [ NOTHING ];
    const embed = new FieldsEmbed()
      .setTitle('Now Playing...')
      .setDescription([
        `[**${isCurrentNothing.info.title}**](${isCurrentNothing.info.uri}) by **${isCurrentNothing.info.author}**`,
        // tslint:disable-next-line:max-line-length
        `${currentSong ? prettifyMs((currentSong.state as any).position) : 'Not Playing'} / ${prettifyMs(isCurrentNothing.info.length)}`,
        `To skip to a song, say \`${this.client.config.prefix}skip <song number>\``,
      ])
      .setColor(0xFE9257)
      .setArray(areTracksNothing)
      .setAuthorizedUsers([ message.author.id ])
      .setChannel(message.channel)
      .setElementsPerPage(5)
      .setPage(page)
      .showPageIndicator(true)
      .formatField(
        '# - Song',
        (t: Song) =>
          // tslint:disable-next-line:max-line-length
          `**${areTracksNothing.indexOf(t) + 1}** - [**${t.info.title}**](${t.info.uri}) by ${t.info.author} (${prettifyMs(t.info.length)})`
      );

    return embed.build();
  }
}
