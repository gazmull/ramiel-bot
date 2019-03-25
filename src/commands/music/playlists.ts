import { Command } from 'discord-akairo';
import { FieldsEmbed as FieldsEmbedMode } from 'discord-paginationembed';
import FieldsEmbed from 'discord-paginationembed/typings/FieldsEmbed';
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
          'Shows songs from a playlist an argument is provided.',
          '\n',
          'Adding **--from=<user>** will search for a playlist name from the specified user instead',
        ],
        usage: '[playlist name] [--from=<user>]',
        examples: [ '', '--from=ramiel', 'Metal-Rock-Covers-by-Rami-Rami-Rami --from=ramiel' ]
      },
      ratelimit: 1,
      channel: 'guild',
      optionFlags: [ '-f', '--from=' ],
      * args () {
        const user = yield {
          type: 'user',
          match: 'option',
          flag: [ '-f', '--from=' ],
          default: (message: Message) => message.author
        };

        const playlist = yield {
          id: 'playlist',
          type: 'lowercase',
          match: 'text'
        };

        return { user, playlist };
      }
    });
  }

  public async exec (message: Message, { user, playlist }: { user: User, playlist: string }) {
    const where = { user: user.id };

    if (playlist)
      Object.assign(where, { name: { [this.client.db.Op.like]: `%${playlist}%` } });

    const lists = await this.client.db.Playlist.findAll({ where, attributes: [ 'name', 'list' ] });

    if (!lists.length)
      return message.util.reply(this.client.dialog(`Hmm... can\'t find one from ${user.tag}.`));

    const Pagination = new FieldsEmbedMode<Song | Playlist>()
      .setAuthorizedUsers([ message.author.id ])
      .setChannel(message.channel)
      .setElementsPerPage(5);

    Pagination.embed.setColor(0xFE9257);

    if (lists.length === 1) return this.doSongs(Pagination as FieldsEmbed<Song>, user, lists.shift());
    if (playlist) {
      const foundExact = lists.find(s => s.name.toLowerCase() === playlist);

      if (foundExact) return this.doSongs(Pagination as FieldsEmbed<Song>, user, foundExact);
    }

    return this.doLists(Pagination as FieldsEmbed<Playlist>, user, lists);
  }

  protected doSongs (Pagination: FieldsEmbed<Song>, user: User, playlist: Playlist) {
    Pagination
      .setArray(playlist.list)
      .formatField(
        '# - Song',
        (t: Song) =>
          // tslint:disable-next-line:max-line-length
          `**${playlist.list.findIndex(e => e.info.identifier === t.info.identifier) + 1}** - [**${t.info.title}**](${t.info.uri}) by ${t.info.author} (${prettifyMs(t.info.length)})`
      )
      .embed
        .setTitle(`${user.tag}'s ${playlist.name}`)
        .setDescription(
          `Add this playlist to the queue with \`${this.client.config.prefix}play ${playlist.name} --from=${user.id}\``
        );

    return Pagination.build();
  }

  protected doLists (Pagination: FieldsEmbed<Playlist>, user: User, playlists: Playlist[]) {
    Pagination
      .showPageIndicator(true)
      .setArray(playlists)
      .formatField('Songs — Playlist', (l: {name: string, list: Song[]}) => `**${l.list.length}** — ${l.name}`)
      .embed
        .setTitle(`${user.tag}'s Playlists`)
        .setDescription(
          `To see a playlist's songs, say \`${this.client.config.prefix}list ${user.id} [playlist name]\``
        );

    return Pagination.build();
  }
}
