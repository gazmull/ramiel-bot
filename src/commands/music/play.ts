import { AkairoClient, Command } from 'discord-akairo';
import { GuildMember, Message, TextChannel, VoiceChannel } from 'discord.js';
import { Player } from 'discord.js-lavalink';
import { GuildQueue, LavalinkResponse, Song } from '../../../typings';
import Playlist from '../../struct/models/Playlist';

export default class PlayCommand extends Command {
  constructor () {
    super('play', {
      aliases: [ 'add', 'play', 'search' ],
      description: {
        content: [
          'Plays or adds a music to the playlist.',
          '\n',
          'Adding **--from=<user>** will search for a playlist name from the specified user instead',
          'Adding **--first** will put the song/playlist to the first queue',
          '\n',
          '**Warning**: Adding a playlist will erase the current queue.',
        ],
        usage: '<keyword> [--first/--from=<user>]',
        examples: [ 'dont let go', 'its okay to be gay', '--first hentai remix', 'myplaylist32 --from=ramiel' ]
      },
      lock: 'guild',
      channel: 'guild',
      ratelimit: 3,
      args: [
        {
          id: 'playlist',
          match: 'option',
          flag: [ '-fr', '--from=' ]
        },
        {
          id: 'unshift',
          match: 'flag',
          flag: [ '-u', '--unshift', '--first' ]
        },
        {
          id: 'keyword',
          type: 'music',
          match: 'text',
          prompt: {
            start: 'What music would you like to play?',
            retry: 'Name is too short. Try again!'
          }
        },
      ]
    });
  }

  public async exec (
    message: Message,
    { playlist, keyword, unshift }: { playlist: string, keyword?: string, unshift: boolean }
  ) {
    const currentList = await this.client.getQueue(message.guild.id);

    if (currentList.tracks.length > 200)
      return message.util.send(this.client.dialog('Forbidden!', 'Queue is currently full. Try again later!'));

    await message.util.send(this.client.dialog('', `${this.client.config.emojis.loading} Searching...`));

    if (keyword && !playlist) {
      const songs = await this.client.getSongs(keyword) as Song[];

      if ((songs as LavalinkResponse).loadType) {
        this.client.setQueue(
          message.guild.id,
          {
            tracks: currentList.tracks.concat((songs as LavalinkResponse).tracks),
            current: currentList.current,
            user: currentList.user,
            channel: currentList.channel,
            host: currentList.host,
            textChannel: {
              id: message.channel.id,
              message: message.id
            }
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
      const resolvedUser = this.client.util.resolveUser(playlist, this.client.users) || message.author;
      const lists = await this.client.db.Playlist.findAll({
        where: {
          user: resolvedUser.id,
          name: { [this.client.db.Op.like]: `%${keyword}%` }
        }
      });

      if (!lists.length)
        return message.util.edit(this.client.dialog(`No Playlist Saved as ${keyword} from ${resolvedUser.tag} Found!`));

      const selected: Playlist = lists.length === 1 ? lists[0] : await this.client.selection.exec(message, this, lists);
      const user = currentList.user ? await message.guild.members.fetch(currentList.user) : null;

      if (await this.cannotOverwrite(this.client, message, user))
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

      this.client.setQueue(message.guild.id, {
        channel: currentList.channel,
        current: currentList.current,
        tracks: selected.list,
        user: message.author.id,
        host: currentList.host,
        textChannel: {
          id: message.channel.id,
          message: message.id
        }
      });
      await message.util.lastResponse.delete();

      return this.play(message);
    }
  }

  public async resurrect (guildID: string, queue: GuildQueue) {
    const resolvedTextChannel = queue.textChannel.id
      ? await this.client.channels.fetch(queue.textChannel.id) as TextChannel
      : null;
    const resolvedVoiceChannel = queue.channel
      ? await this.client.channels.fetch(queue.channel)
      : null;
    const resolvedTextMessage = queue.textChannel.message
      ? await resolvedTextChannel.messages.fetch(queue.textChannel.message)
      : null;

    if (!resolvedTextChannel || !resolvedVoiceChannel || !resolvedTextMessage) return this.client.deleteQueue(guildID);

    const player = await this.client.music.lavalink.join({
      guild: guildID,
      channel: resolvedVoiceChannel.id,
      host: queue.host
    }, { selfdeaf: true });

    return this.process(resolvedTextMessage, player, queue);
  }

  public async play (message: Message, song?: Song, unshift = false) {
    const nodes = this.client.music.lavalink.nodes;
    const player = await this.client.music.lavalink.join({
      guild: message.guild.id,
      channel: message.member.voice.channelID,
      host: nodes.find(N => N.stats.players === Math.min.apply(null, nodes.map(n => n.stats.players))).host
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
    else if (channel.members.filter(m => m.id !== m.guild.me.id && m.user.bot).size) {
      await this.client.music.lavalink.leave(message.guild.id);

      return message.channel.send(
        this.client.dialog('H-hey... I\'m nervous a-around other b-bots... no... n-no thank y-you...!')
      );
    }
    else if (!channel.members.filter(m => !m.user.bot).size) {
      await this.client.music.lavalink.leave(message.guild.id);

      return message.channel.send(this.client.dialog('No users in the channel... left for good!'));
    }

    const currentList = await this.client.getQueue(message.guild.id);
    const user = currentList.user ? await message.guild.members.fetch(currentList.user) : null;
    const unshiftable = unshift && await this.cannotOverwrite(this.client, message, user);

    if (song) {
      if (unshiftable)
        currentList.tracks.unshift(song);
      else
        currentList.tracks.push(song);

      currentList.channel = channel.id;
      await this.client.setQueue(message.guild.id, currentList);
    }

    if (!currentList.tracks.length) {
      await this.client.deleteQueue(message.guild.id, false);

      return message.channel.send(
        this.client.dialog('Empty Queue', 'Nothing to sing... leaving the channel!')
      );
    }

    if (!player.playing)
      return this.process(message, player, currentList);

    return message.reply(
      this.client.dialog(
        `Added to queue!${unshiftable ? ' (First on Queue)' : ''}`,
        song
          ? `[**${song.info.title}**](${song.info.uri}) by **${song.info.author}**`
          : `${currentList.tracks.length} entries has been added.`
      )
    );
  }

  protected async process (message: Message, player: Player, currentList: GuildQueue) {
    const current = currentList.tracks.shift();
    const next = currentList.tracks[0];
    currentList.current = current;

    this.client.setQueue(message.guild.id, currentList);

    player
      .play(current.track)
      .once('disconnect', async err => {
        await this.client.music.lavalink.leave(message.guild.id);

        throw err;
      })
      .once('error', async err => {
        await this.client.music.lavalink.leave(message.guild.id);

        throw err;
      })
      .once('end', async (data: any) => {
        if (data.reason === 'REPLACED') return;

        const _currentList = await this.client.getQueue(message.guild.id);

        if (_currentList.tracks.length) {
          player.removeAllListeners();

          return this.play(message);
        }

        await message.channel.send(this.client.dialog('Songs queue has ended!'));
        await this.client.deleteQueue(message.guild.id, false);
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

  public async cannotOverwrite (client: AkairoClient, message: Message, user: GuildMember) {
    const role = await client.db.Moderator.findOne({ where: { guild: message.guild.id } });

    return (
      (user && user.hasPermission('MANAGE_GUILD') && !message.member.hasPermission('MANAGE_GUILD')) ||
      (user && role && user.roles.has(role.id) && !message.member.roles.has(role.id))
    );
  }
}
