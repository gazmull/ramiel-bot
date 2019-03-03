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
    const cannotOverwrite = (this.handler.modules.get('play') as PlayCommand).cannotOverwrite;
    const hasPlaylist = this.client.getQueue(message.guild.id).user;
    const resolvedUser = hasPlaylist ? await message.guild.members.fetch(hasPlaylist) : null;

    if (await cannotOverwrite(this.client, message, resolvedUser)) return;

    const player = this.client.music.lavalink.get(message.guild.id);

    if (!player)
      return message.util.reply(this.client.dialog('Huh?', 'I don\'t have any song to resume with. Why bother?'));

    if (!player.paused)
      return message.util.reply(this.client.dialog('Argh...', 'I have no time to play with you!'));

    player.pause(false);

    return message.channel.send(this.client.dialog('Alright, alright, alrIGHT!'));
  }
}
