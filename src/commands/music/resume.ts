import { Command } from 'discord-akairo';
import { Message } from 'discord.js';
import PlayCommand from './play';

export default class ResumeCommand extends Command {
  constructor () {
    super('resume', {
      aliases: [ 'resume', 'res', 'unpause' ],
      description: { content: 'Resumes the paused player. Prioritises Moderators.' },
      channel: 'guild',
      ratelimit: 1
    });
  }

  public async exec (message: Message) {
    const playCommand = (this.handler.modules.get('play') as PlayCommand);
    const myQueue = await this.client.getQueue(message.guild.id);
    const resolvedUser = myQueue.user ? await message.guild.members.fetch(myQueue.user) : null;

    if (await playCommand.cannotOverwrite.bind(playCommand, message, resolvedUser)()) return;
    if (myQueue.current) return playCommand.resurrect.bind(playCommand, message.guild.id, myQueue)();

    const player = this.client.music.lavalink.get(message.guild.id);

    if (!player)
      return message.util.reply(this.client.dialog('Huh?', 'I don\'t have any song to resume with. Why bother?'));

    if (!player.paused)
      return message.util.reply(this.client.dialog('Argh...', 'I have no time to play with you!'));

    player.pause(false);

    return message.channel.send(this.client.dialog('Alright, alright, alrIGHT!'));
  }
}
