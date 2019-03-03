import { Command } from 'discord-akairo';
import { FieldsEmbed } from 'discord-paginationembed';
import { Message, User } from 'discord.js';
import { Song } from '../../../typings';
import Playlist from '../../struct/models/Playlist';
import prettifyMs from '../../util/prettifyMs';

export default class PlaylistsCommand extends Command {
  constructor () {
    super('playlists', {
      aliases: [ 'playlists', 'playlist', 'pl', 'list', 'lists', 'l', 'tracks' ],
      description: {
        content: [
          'Shows someone\'s saved playlists.',
          'Shows songs from a playlist when second argument is filled up.',
        ],
        usage: '[user] [playlist name]',
        examples: [ '', 'ramiel', 'ramiel Metal-Rock-Covers-by-Rami-Rami-Rami' ]
      },
      ratelimit: 1,
      channel: 'guild',
      args: [
        {
          id: 'user',
          type: 'user',
          default: (message: Message) => message.author
        },
        {
          id: 'playlist',
          match: 'rest'
        },
      ]
    });
  }

  public async exec (message: Message, { user, playlist }: { user: User, playlist: string }) {
    const where = { user: user.id };

    if (playlist)
      Object.assign(where, { name: { [this.client.db.Op.like]: `%${playlist}%` } });

    const lists = await this.client.db.Playlist.findAll({ where, attributes: [ 'name', 'list' ] });

    if (!lists.length)
      return message.util.reply(this.client.dialog('Hmm... can\'t find one.'));

    const embed = new FieldsEmbed()
      .setColor(0xFE9257)
      .setAuthorizedUsers([ message.author.id ])
      .setChannel(message.channel)
      .setElementsPerPage(5);

    if (lists.length === 1) return this.doSongs(embed, user, lists.shift());

    return this.doLists(embed, user, lists);
  }

  protected doSongs (embed: FieldsEmbed, user: User, playlist: Playlist) {
    return embed
      .setArray(playlist.list)
      .setTitle(`${user.tag}'s ${playlist.name}`)
      .setDescription(
        `Add this playlist to the queue with \`${this.client.config.prefix}play ${playlist.name} --from=${user.id}\``
      )
      .formatField(
        '# - Song',
        (t: Song, i: number) =>
          `**${i + 1}** - [**${t.info.title}**](${t.info.uri}) by ${t.info.author} (${prettifyMs(t.info.length)})`
      )
      .build();
  }

  protected doLists (embed: FieldsEmbed, user: User, playlists: Playlist[]) {
    return embed
      .setTitle(`${user.tag}'s (${user.id}) Playlists`)
      .setDescription(`To see a playlist's songs, say \`${this.client.config.prefix}list ${user.id} [playlist name]\``)
      .showPageIndicator(true)
      .setArray(playlists)
      .formatField('Songs — Playlist', (l: {name: string, list: Song[]}) => `**${l.list.length}** — ${l.name}`)
      .build();
  }
}