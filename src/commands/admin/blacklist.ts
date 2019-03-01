import { Command } from 'discord-akairo';
import { Message, User } from 'discord.js';

export default class BlacklistCommand extends Command {
  constructor () {
    super('blacklist', {
      aliases: [ 'blacklist', 'bl', 'block' ],
      description: {
        content: 'Blocks/unblocks a user from using my commands.',
        usage: '<user> [reason]',
        examples: [ 'eros stupid lab rat' ]
      },
      channel: 'guild',
      userPermissions: [ 'MANAGE_GUILD' ],
      args: [
        {
          id: 'user',
          type: 'user',
          prompt: {
            start: 'Who would you like to block/unblock?',
            retry: 'Neh... I don\'t think that is a valid user. Try again!'
          }
        },
        {
          id: 'reason',
          match: 'rest',
          default: null
        },
      ]
    });
  }

  public async exec (message: Message, { user, reason }: { user: User, reason: string }) {
    const found = await this.client.db.Blacklist.findOne({ where: { user: user.id } });
    let notified = 'The violator was not notified';

    if (!found) {
      const newBlock = new this.client.db.Blacklist();
      newBlock.user = user.id;
      newBlock.admin = message.author.id;
      newBlock.reason = reason;

      await newBlock.save();
      await user.send([
        `You have been blocked from using my commands due to: **${reason || 'No reason given.'}**`,
        `Is this a mistake? Contact ${message.author}!`,
      ])
        .then(() => notified = 'The violator was notified')
        .catch();

      return message.util.reply(
        this.client.dialog(
          `Succesfully Blacklisted!`,
          [
            `${user} has been blocked from using my commands due to: **${reason || 'No reason given.'}**`,
            `\n${notified} regarding this action.`,
          ]
        )
      );
    }

    await found.destroy();
    await user.send([
      `You have been unblocked from using my commands. Hooray!`,
      `~~Is this a mistake? Contact ${message.author}!~~`,
      `If you have forgotten about the commands, please see **${this.client.config.prefix}help**`,
    ])
      .then(() => notified = 'The violator was notified')
      .catch();

    return message.util.reply(
      this.client.dialog(
        `Succesfully Whitelisted!`,
        [
          `${user} has been unblocked from using my commands. Yay?`,
          `\n${notified} regarding this action.`,
        ]
      )
    );
  }
}
