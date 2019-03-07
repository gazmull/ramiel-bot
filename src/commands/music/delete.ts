import { Command } from 'discord-akairo';
import { Message } from 'discord.js';

export default class DeleteCommand extends Command {
  constructor () {
    super('delete', {
      aliases: [ 'delete', 'del' ],
      description: {
        content: 'Deletes a playlist from your account.',
        usage: '<playlist name>',
        examples: [
          'My First Playlist',
          'curing my lung cancer',
        ]
      },
      channel: 'guild',
      ratelimit: 1,
      args: [
        {
          id: 'name',
          type: 'music',
          match: 'text',
          prompt: {
            start: 'What is the name of the playlist you wish to delete?',
            retry: 'Name is too short. Try Again!'
          }
        },
      ]
    });
  }

  public async exec (message: Message, { name }: { name: string }) {
    const deleted = await this.client.db.Playlist.destroy({
      where: {
        user: message.author.id,
        name
      }
    });

    return message.util.reply(
      this.client.dialog(
        deleted
          ? `Successfully deleted ${name}!`
          : `Uh-oh... couldn't delete ${name}. Try again!`
      )
    );
  }
}
