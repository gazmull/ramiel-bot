import { Command } from 'discord-akairo';
import { GuildMember, Message, TextChannel, User, VoiceChannel } from 'discord.js';
import { Player } from 'discord.js-lavalink';
import { GuildQueue, LavalinkResponse, Song } from '../../../typings';
import Playlist from '../../struct/models/Playlist';

export default class PlayCommand extends Command {
  constructor () {
    super('play', {
      aliases: [ 'play', 'add', 'search' ],
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
          id: 'user',
          type: 'user',
          match: 'option',
          flag: [ '-fr', '--from=' ]
        },
        {
          id: 'unshift',
          match: 'flag',
          flag: [ '--unshift', '--first' ]
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
    { user, keyword, unshift }: { user: User, keyword?: string, unshift: boolean }
  ) {
    const currentList = await this.client.getQueue(message.guild.id);

    if (currentList.tracks.length > 200)
      return message.util.send(this.client.dialog('Forbidden!', 'Queue is currently full. Try again later!'));
    if (!currentList.host) {
      const nodes = this.client.music.lavalink.nodes;
      const selected = nodes.find(N => N.stats.players === Math.min.apply(null, nodes.map(n => n.stats.players)));
      currentList.host = selected ? selected.host : 'localhost';
    }
    if (!currentList.textChannel.id) {
      currentList.textChannel.id = message.channel.id;
      currentList.textChannel.message = message.id;
    }

    await message.util.send(this.client.dialog('', `${this.client.config.emojis.loading} Searching...`));

    if (keyword && !user) {
      const songs = await this.client.getSongs(keyword) as Song[];

      if ((songs as LavalinkResponse).loadType) {
        currentList.tracks = currentList.tracks.concat((songs as LavalinkResponse).tracks);

        this.client.setQueue(message.guild.id, currentList);
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
    } else if (user) {
      const lists = await this.client.db.Playlist.findAll({
        where: {
          user: user.id,
          name: { [this.client.db.Op.like]: `%${keyword}%` }
        }
      });

      if (!lists.length)
        return message.util.edit(this.client.dialog(`No Playlist Saved as ${keyword} from ${user.tag} Found!`));

      const selected: Playlist = lists.length === 1 ? lists[0] : await this.client.selection.exec(message, this, lists);
      const targetUser = currentList.user ? await message.guild.members.fetch(currentList.user) : null;

      if (await this.cannotOverwrite(message, targetUser))
        return message.util.edit(
          this.client.dialog(
            'Not Allowed To Override Current Playlist',
            [
              `${targetUser}, who is a server staff member, has loaded up his/her playlist at the moment.`,
              // tslint:disable-next-line:max-line-length
              'You may not load up your own, or please try contacting him/her to destroy the current playlist I am holding!',
            ]
          )
        );

      currentList.tracks = selected.list;
      currentList.user = message.author.id;

      this.client.setQueue(message.guild.id, currentList);
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
    const currentList = await this.client.getQueue(message.guild.id);
    const player = await this.client.music.lavalink.join({
      guild: message.guild.id,
      channel: message.member.voice.channelID,
      host: currentList.host
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

    currentList.channel = channel.id;
    const user = currentList.user ? await message.guild.members.fetch(currentList.user) : null;
    const unshiftable = unshift && !(await this.cannotOverwrite(message, user));

    if (song) {
      if (unshiftable)
        currentList.tracks.unshift(song);
      else
        currentList.tracks.push(song);

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
    const current = currentList.current || currentList.tracks.shift();
    const next = currentList.tracks[0];
    currentList.current = current;

    await this.client.setQueue(message.guild.id, currentList);

    player
      .play(current.track)
      .once('disconnect', async err => {
        currentList.current.info.position = (player.state as any).position;
        await this.client.setQueue(message.guild.id, currentList);
        await this.client.music.lavalink.leave(message.guild.id);

        throw err;
      })
      .once('error', async err => {
        currentList.current.info.position = (player.state as any).position;
        await this.client.setQueue(message.guild.id, currentList);
        await this.client.music.lavalink.leave(message.guild.id);

        throw err;
      })
      .once('end', async (data: any) => {
        if (data.reason === 'REPLACED') return;

        const _currentList = await this.client.getQueue(message.guild.id);

        if (_currentList.tracks.length) {
          _currentList.current = null;

          await this.client.setQueue(message.guild.id, _currentList);
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

  public async cannotOverwrite (message: Message, user: GuildMember) {
    const role = await this.client.db.Moderator.findOne({ where: { guild: message.guild.id } });

    return (
      (user && user.hasPermission('MANAGE_GUILD') && !message.member.hasPermission('MANAGE_GUILD')) ||
      (user && role && user.roles.has(role.id) && !message.member.roles.has(role.id))
    );
  }
}
