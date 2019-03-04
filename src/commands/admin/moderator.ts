import { Command } from 'discord-akairo';
import { Message, Role } from 'discord.js';

export default class ModeratorCommand extends Command {
  constructor () {
    super('moderator', {
      aliases: [ 'moderator', 'mod', 'modrole' ],
      description: {
        content: 'See or set the Music Moderator role',
        usage: '[role]',
        examples: [ '', 'DJ' ]
      },
      channel: 'guild',
      userPermissions: [ 'MANAGE_GUILD' ],
      args: [
        {
          id: 'role',
          type: 'role',
          default: null
        },
      ]
    });
  }

  public async exec (message: Message, { role }: { role: Role }) {
    if (!role) {
      const found = await this.client.db.Moderator.findOne({ where: { guild: message.guild.id } });

      if (!found) return message.util.reply(this.client.dialog('No moderator role is set. Set one today!'));

      // @ts-ignore
      const resolvedRole = found.role ? await message.guild.roles.fetch(found.role) as Role : null;

      if (!resolvedRole)
        return message.util.reply(
          this.client.dialog('I cannot resolve the set moderator role. Wanna try setting one again today?')
        );

      return message.util.reply(this.client.dialog('Current Moderator Role', resolvedRole.toString()));
    }

    const updated = await this.client.db.Moderator.upsert({
      guild: message.guild.id,
      role: role.id
    });

    return message.util.reply(
      this.client.dialog(
        updated
          ? `Moderator Role set to ${role.name}!`
          : `Uh-oh... couldn't set Moderator Role to ${role.name}. Try again!`
      )
    );
  }
}
