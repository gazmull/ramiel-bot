import { Command } from 'discord-akairo';
import { Message } from 'discord.js';

export default class RamielError {

  /**
   * Constructor for ErosError.
   * @param message - The Message object of the client.
   * @param command - The command that was used.
   * @param error - The Error object, if there is one.
   */
  constructor (message: Message, command: Command, error: Error = null) {
    this.message = message;

    this.command = command;

    this.err = error;

    this.exec();
  }

  protected message: Message;

  protected command: Command;

  protected err: Error;

  protected exec () {
    if (this.err) this.command.client.logger.error(this.err);

    let title = 'An error occured';

    if (this.command) title = `Command **\`${this.command.id}\`** failed`;

    const message = [
      `${title}:`,
      '\`\`\`x1',
      `${this.err}\`\`\``,
      `\nIs it a consistent error? Submit an issue here: ${this.message.client.config.supportLink}`,
    ];

    return this.message.util.lastResponse
      ? this.message.util.edit(message, { embed: null })
      : this.message.util.send(message);
  }
}
