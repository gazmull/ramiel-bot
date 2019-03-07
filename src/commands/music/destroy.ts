import { Command } from 'discord-akairo';
import { Message } from 'discord.js';
import PlayCommand from './play';

export default class DestroyCommand extends Command {
  constructor () {
    super('destroy', {
      aliases: [ 'destroy' ],
      description: { content: 'Destroys the current queue. Prioritises Moderators.' },
      ratelimit: 1,
      channel: 'guild'
    });
  }

  public async exec (message: Message) {
    const playCommand = (this.handler.modules.get('play') as PlayCommand);
    const hasPlaylist = this.client.music.queues.get(message.guild.id);
    const resolvedUser = hasPlaylist && hasPlaylist.user ? await message.guild.members.fetch(hasPlaylist.user) : null;

    if (await playCommand.cannotOverwrite.bind(playCommand, message, resolvedUser)()) return;

    const result = await this.client.deleteQueue(message.guild.id, false);

    return message.channel.send(
      this.client.dialog(result ? 'Left successfully!' : 'Hmmm nope, not gonna happen.')
    );
  }
}
