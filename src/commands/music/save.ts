import { Command } from 'discord-akairo';
import { Message } from 'discord.js';
import { LavalinkResponse } from '../../../typings';

export default class SaveCommand extends Command {
  constructor () {
    super('save', {
      aliases: [ 'save' ],
      description: {
        content: [
          'Saves the current queue or provided link (with --link) as a playlist into your account.',
          '**Warning**: This will replace an existing playlist name. Make sure to check your saved playlists first.',
        ],
        usage: '[--link=<playlist link>] <playlist name>',
        examples: [
          'My First Playlist',
          '--link=https://www.youtube.com/playlist?list=PLrAaO14ZVq57MHiVS3A4J3RersQz1iq9i curing my lung cancer',
        ]
      },
      channel: 'guild',
      ratelimit: 1,
      args: [
        {
          id: 'link',
          match: 'option',
          flag: [ '-l', '--link=' ]
        },
        {
          id: 'name',
          type: 'music',
          match: 'text',
          prompt: {
            start: 'What would you like to name the new playlist as?',
            retry: 'Name is too short. Try Again!'
          }
        },
      ]
    });
  }

  public async exec (message: Message, { link, name }: { link: string, name: string }) {
    if (link) {
      link = this.handler.resolver.type('url')(link, message, { });
      const resolved = await this.client.getSongs(link);

      if (!(resolved as LavalinkResponse).loadType)
        return message.util.reply(this.client.dialog('Not a valid playlist!'));

      const [ lUpdated ] = await this.client.db.Playlist.findOrCreate({
        where: {
          user: message.author.id,
          name
        }
      });

      await lUpdated.update({ list: (resolved as LavalinkResponse).tracks });

      return message.util.reply(
        this.client.dialog(
          lUpdated
            ? `Successfully saved as ${name}!`
            : `Uh-oh... couldn't save ${name}. Try again!`,
          lUpdated
            // tslint:disable-next-line:max-line-length
            ? `If you want to play this playlist, say \`${this.client.config.prefix}play ${name} --from=${message.author.id}\``
            : ''
        )
      );
    }

    const queue = await this.client.getQueue(message.guild.id);

    if (!queue.tracks.length) return message.util.reply(this.client.dialog('Well, nothing to save...'));

    const [ qUpdated ] = await this.client.db.Playlist.findOrCreate({
      where: {
        user: message.author.id,
        name
      }
    });

    if (queue.current) queue.tracks.unshift(queue.current);

    await qUpdated.update({ list: queue.tracks });

    return message.util.reply(
      this.client.dialog(
        qUpdated
          ? `Successfully saved as ${name}!`
          : `Uh-oh... couldn't save ${name}. Try again!`,
        qUpdated
          // tslint:disable-next-line:max-line-length
          ? `If you want to play this playlist, say \`${this.client.config.prefix}play ${name} --from=${message.author.id}\``
          : ''
      )
    );
  }
}
