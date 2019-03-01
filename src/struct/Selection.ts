import { Command } from 'discord-akairo';
import { Message, TextChannel } from 'discord.js';
import { Song } from '../../typings';
import RamielClient from './RamielClient';

export default class Selection {
  constructor (client: RamielClient) {
    this.client = client;
  }

  protected client: RamielClient;

  public async exec (message: Message, command: Command, rows: Song[]) {
    const client = this.client;
    const embed = client.util.embed()
      .setColor(0xFF00AE)
      .setTitle('Selection')
      .setFooter('Expires within 30 seconds.')
      .setDescription(
        [
          'Select an item by their designated `number` to continue.',
          'Saying `cancel` or `0` will cancel the command.',
          '\n',
          rows.map((v, i) => `**${i + 1}** - [${v.info.title}](${v.info.uri})`).join('\n'),
        ]
      );

    await message.util.edit(embed);

    let row = null;

    try {
      const channel = message.channel as TextChannel;
      const responses = await channel.awaitMessages(
        m =>
          m.author.id === message.author.id &&
          (m.content.toLowerCase() === 'cancel' || parseInt(m.content) === 0 ||
            (parseInt(m.content) >= 1 && parseInt(m.content) <= rows.length)), {
          errors: [ 'time' ],
          max: 1,
          time: 30 * 1000
        }
      );

      const response = responses.first();
      const index = parseInt(response.content);
      if (response.content.toLowerCase() === 'cancel' || index === 0)
        message.util.edit('Selection cancelled.', { embed: null });

      row = rows[index - 1];

      if (message.guild && channel.permissionsFor(message.guild.me).has('MANAGE_MESSAGES'))
        response.delete();
    } catch (err) {
      // tslint:disable-next-line:no-unused-expression
      if (err instanceof Error) new client.RamielError(message, command, err);
      else message.util.edit('Selection expired.', { embed: null });
    }

    return row;
  }
}
