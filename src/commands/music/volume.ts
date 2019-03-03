import { Command } from 'discord-akairo';
import { Message } from 'discord.js';

export default class VolumeCommand extends Command {
  constructor () {
    super('volume', {
      aliases: [ 'volume', 'vol', 'v' ],
      description: {
        content: 'Sets the player\'s volume. Server Managers only.',
        usage: '<0 - 200>',
        example: [ '50', '200' ]
      },
      ratelimit: 1,
      channel: 'guild',
      args: [
        {
          id: 'volume',
          type: phrase => {
            if (!phrase || isNaN(Number(phrase))) return null;

            const num = parseInt(phrase);

            if (num < 0 || num > 200) return null;

            return num;
          },
          prompt: {
            start: 'How loud should the player be?',
            retry: 'Uhm... yeah try again, between `0` and `200`.'
          }
        },
      ]
    });
  }

  public async exec (message: Message, { volume }: { volume: number }) {
    if (!message.member.hasPermission('MANAGE_GUILD'))
      return message.util.reply(
        this.client.dialog(
          'For Server Managers Only',
          [
            'This command is not available for everyone due to performance impact.',
            'If you would like to adjust your volume *permanently*, please follow the image:',
            '- Right click Ramiel (while in a voice channel) to show the options',
          ]
        )
        .setImage('https://cdn.discordapp.com/attachments/452393190310281217/551862604474220564/unknown.png')
      );

    const player = this.client.music.lavalink.get(message.guild.id);

    if (!player) return message.util.reply(this.client.dialog('Player is not active...'));

    player.volume(volume);

    return message.util.reply(this.client.dialog(`Volume has been adjusted to ${volume}%.`));
  }
}
