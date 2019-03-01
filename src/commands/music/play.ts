import { Command, Control } from 'discord-akairo';
import { GuildMember, Message, VoiceChannel } from 'discord.js';
import { Song } from '../../../typings';

export default class PlayCommand extends Command {
  constructor () {
    super('play', {
      aliases: [ 'add', 'play', 'search' ],
      description: {
        content: 'Plays or adds a music to the playlist.',
        usage: '<keyword>',
        examples: [ 'dont let me go', 'its okay to be gay', 'hentai remix --first', '--playlist' ]
      },
      lock: 'guild',
      channel: 'guild',
      ratelimit: 2,
      args: [
        {
          id: 'playlist',
          match: 'flag',
          flag: [ '-p', '--playlist' ]
        },
        Control.if((_, { playlist }) => playlist, [],
          [
            {
              id: 'keyword',
              type: 'length',
              match: 'content',
              prompt: {
                start: 'What music would you like to play?',
                retry: 'Name is too short. Try again!'
              }
            },
          ]
        ),
        {
          id: 'unshift',
          match: 'flag',
          flag: [ '-u', '--unshift', '-f', '--first' ]
        },
      ]
    });
  }

  public async exec (
    message: Message,
    { playlist, keyword, unshift }: { playlist: string, keyword?: string, unshift: boolean }
  ) {
    if (this.client.getQueue(message.guild.id).tracks.length > 15)
      return message.util.send(this.client.dialog('Forbidden!', 'Queue is current full. Try again later!'));

    await message.util.send(this.client.dialog('', `${this.client.config.emojis.loading} Searching...`));

    if (keyword) {
      const songs: Song[] = await this.client.getSongs(keyword);

      if ((songs as any).loadType) {
        const currentList = this.client.getQueue(message.guild.id);
        this.client.music.queues.set(
          message.guild.id,
          {
            tracks: currentList.tracks.concat((songs as any).tracks),
            current: currentList.current,
            user: null
          }
        );

        await message.util.lastResponse.delete();

        return this.play(message);
      }
      if (!songs.length) return message.util.edit(this.client.dialog(`No results for "${keyword}" found`));
      if (songs.length === 1) {
        await message.util.lastResponse.delete();

        return this.play(message, songs[0], unshift);
      }

      const song: Song = await this.client.selection.exec(message, this, songs);

      if (!song || song instanceof Message) return;

      await message.util.lastResponse.delete();

      return this.play(message, song, unshift);
    } else if (playlist) {
      const myList = await this.client.db.Playlist.findOne({ where: { user: message.author.id } });
      const prefix = this.client.config.prefix;

      if (!myList)
        return message.util.edit(
          this.client.dialog(
            'No Playlist Saved!',
            [
              'I swear I can\'t find one...',
              `How about adding some songs with **${prefix}play <song>**, and then do **${prefix}save**?`,
            ]
          )
        );

      const currentList = this.client.getQueue(message.guild.id);
      const user = currentList.user ? await message.guild.members.fetch(currentList.user) : null;

      if (!this.cannotOverwrite(message, user))
        return message.util.edit(
          this.client.dialog(
            'Not Allowed To Override Current Playlist',
            [
              `${user}, who is a server staff member, has loaded up his/her playlist at the moment.`,
              // tslint:disable-next-line:max-line-length
              'You may not load up your own, or please try contacting him/her to destroy the current playlist I am holding!',
            ]
          )
        );

      this.client.music.queues.set(message.guild.id, { tracks: JSON.parse(myList.list), user: message.author.id });

      return this.play(message);
    }
  }

  public async play (message: Message, song?: Song, unshift = false) {
    const player = await this.client.music.lavalink.join({
      guild: message.guild.id,
      channel: message.member.voice.channelID,
      host: this.client.music.lavalink.nodes.first().host
    }, { selfdeaf: true });
    const channel = await this.client.channels.fetch(player.channel) as VoiceChannel;

    if (!player || !channel || !channel.joinable)
      return message.reply(
        this.client.dialog(
          'I couldn\'t join the channel for some reason. You should let me see and connect to that channel!'
        )
      );
    else if (!channel.speakable)
      return message.reply(
        this.client.dialog(
          'Well... how am I suppose to release these feelings with a channel that restricts me from singing?'
        )
      );
    else if (!channel.members.filter(m => !m.user.bot).size) {
      await this.client.music.lavalink.leave(message.guild.id);
      this.client.music.queues.delete(message.guild.id);

      return message.channel.send(
        this.client.dialog('No users in the channel... left for good!')
      );
    }

    if (player.paused) player.resume();

    const currentList = this.client.getQueue(message.guild.id);
    const user = currentList.user ? await message.guild.members.fetch(currentList.user) : null;
    const unshiftable = unshift && !this.cannotOverwrite(message, user);

    if (song) {
      if (unshiftable)
        currentList.tracks.unshift(song);
      else
        currentList.tracks.push(song);

      this.client.music.queues.set(message.guild.id, currentList);
    }

    if (!currentList.tracks.length) {
      await this.client.music.lavalink.leave(message.guild.id);

      return message.channel.send(
        this.client.dialog('Empty Queue', 'Nothing to sing... leaving the channel!')
      );
    }

    if (!player.playing) {
      const current = currentList.tracks.shift();
      const next = currentList.tracks[0];
      currentList.current = current;

      this.client.music.queues.set(message.guild.id, currentList);

      player
        .play(current.track)
        .once('error', async err => {
          await this.client.music.lavalink.leave(message.guild.id);

          throw err;
        })
        .once('end', async (data: any) => {
          if (data.reason === 'REPLACED') return;

          const _currentList = this.client.getQueue(message.guild.id);

          if (_currentList.tracks.length) {
            player.removeAllListeners();

            return this.play(message);
          }

          await message.channel.send(this.client.dialog('Songs queue has ended!'));
          await this.client.music.lavalink.leave(message.guild.id);
        });

      return message.channel.send(
        this.client.dialog(
          'Now Playing!',
          [
            `[**${current.info.title}**](${current.info.uri}) by **${current.info.author}**`,
            next ? `\nNext: [**${next.info.title}**](${next.info.uri}) by **${next.info.author}**` : '',
          ]
        )
      );
    }

    return message.reply(
      this.client.dialog(
        `Added to queue!${unshiftable ? ' (First on Queue)' : ''}`,
        song
          ? `[**${song.info.title}**](${song.info.uri}) by **${song.info.author}**`
          : ''
      )
    );
  }

  protected cannotOverwrite (message: Message, user: GuildMember) {
    return user && user.hasPermission('MANAGE_GUILD') && !message.member.hasPermission('MANAGE_GUILD');
  }
}
