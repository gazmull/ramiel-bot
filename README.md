![what are you looking at](https://github.com/gazmull/ramiel-bot/blob/master/ramieru.png?raw=true)

![GitHub package.json version](https://img.shields.io/github/package-json/v/gazmull/ramiel-bot.svg?logo=github&style=for-the-badge)

![Travis (.org)](https://img.shields.io/travis/gazmull/ramiel-bot.svg?logo=travis&style=for-the-badge) ![Docker Build Status](https://img.shields.io/docker/cloud/build/gazmull/ramiel-bot.svg?logo=docker&style=for-the-badge&label=Build)

![MicroBadger Size](https://img.shields.io/microbadger/image-size/gazmull/ramiel-bot.svg?style=for-the-badge&logo=Docker&label=Size) ![MicroBadger Layers](https://img.shields.io/microbadger/layers/gazmull/ramiel-bot.svg?style=for-the-badge&logo=Docker&label=Layers) ![Docker Automated build](https://img.shields.io/docker/cloud/automated/gazmull/ramiel-bot.svg?style=for-the-badge&logo=Docker&label=Build) ![Docker Pulls](https://img.shields.io/docker/pulls/gazmull/ramiel-bot.svg?style=for-the-badge&logo=Docker&label=Pulls)

# Ramiel
- Built with [**Discord.JS-Akairo Framework** (**Master**)](https://github.com/1computer1/discord-akairo) and [**Discord.JS-Lavalink Client**](https://github.com/MrJacz/discord.js-lavalink)
    - [**Discord.JS-Akairo Documentation**](https://1computer1.github.io/discord-akairo/master)
    - [**Discord.JS-Lavalink Documentation**](https://mrjacz.github.io/discord.js-lavalink)
- [**Discord Server**](http://erosdev.thegzm.space)
- [**Bot Guide**](https://docs.thegzm.space/ramiel-bot) (N/A)

# Features
- Just a music bot, what else?
- Currently only supports Youtube search and Direct links.

# Commands
**Prefix**: `r!` / `ramiel, ` / `@Ramiel`

> See `r!help <command>` for a better command description.

> __Not final__.

**Admin**
- `blacklist` - Blocks/unblocks a user from using Ramiel's commands
- `moderator` - See or set the current Music Queue Moderator

**General**
- `help` - Displays reference for Ramiel's commands

**Music**
- `destroy` - Destroys the player and tells Ramiel to leave the channel
- `play` - Plays a song or adds a song to the current queue
- `playlists` - Displays your saved playlists or other user's playlists
- `pause` - Pauses the current song
- `queue` - Displays the current queue and the current song playing
- `save` - Saves the current queue as a playlist to your account
- `seek` - Seeks to a specified time within the song
- `stop` - Stops/skips the current song (leaves when there are no songs left in the queue)
- `volume` - Sets the player volume (Moderators only)

**Utility**
- `eval` (**bot owner only**) - Evaluates a Javascript syntax text
- `ping` - Pokes Ramiel
- `stats` - Displays Ramiel's [technical] information

# Self-Hosting
> The following items are required: [**Discord Bot Account**](https://github.com/reactiflux/discord-irc/wiki/Creating-a-discord-bot-&-getting-a-token), [**Docker-CE**](https://hub.docker.com/search/?type=edition&offering=community), and at least [**MariaDB 10.1**](https://mariadb.org/)

> This section assumes that the user has basic knowledge of workflow in his/her machine (e.g: how to run a command shell). If not then ask everyone's bestfriend, Google, first.

> **$** denotes it should be executed at a command shell.

## Build from Source

1. `$ git clone https://github.com/gazmull/ramiel-bot.git ramiel && cd ramiel`
2. Create an `auth.js` file and obtain the template from [**auth.example.js**](https://github.com/gazmull/ramiel-bot/blob/master/auth.example.js).
3. [**Set up MariaDB**](#setting-up-mariadb)
4. Create an `application.yml` file and obtain the template from [**application.example.yml**](https://github.com/gazmull/ramiel-bot/blob/master/application.example.yml).
5. Optional: edit `docker-compose.yml` according to preferences, although it is already properly configured.
   - **!** - To disable automatic updates from [**gazmull/ramiel-bot**](http://dockerhub.com/r/gazmull/ramiel-bot), make sure to put the watchtower service in comments.
6. `$ docker-compose up -d`

## Pre-built
> This repository has a pre-built Docker image over here: [**gazmull/ramiel-bot**](http://dockerhub.com/r/gazmull/ramiel-bot)

1. Create a folder named `ramiel` and then do the following in it:
2. Create an `auth.js` file and obtain the template from [**auth.example.js**](https://github.com/gazmull/ramiel-bot/blob/master/auth.example.js).
3. [**Set up MariaDB**](#setting-up-mariadb)
4. Create an `application.yml` file and obtain the template from [**application.example.yml**](https://github.com/gazmull/ramiel-bot/blob/master/application.example.yml).
5. Edit the `docker-compose.yml` file and obtain the template from [**docker-compose (prebuilt)**](https://gist.github.com/gazmull/1d13c735c86de2598c701968afbc6bcd).
   - Optional: edit `docker-compose.yml` according to preferences, although it is already properly configured.
     - **!** - To disable automatic updates from [**gazmull/ramiel-bot**](http://dockerhub.com/r/gazmull/ramiel-bot), make sure to put the watchtower service in comments.
6. `$ docker-compose up -d`

## Next Step
> This assumes that the user is in the `ramiel` folder.

Here are some commands to execute while running Ramiel:

- `$ docker-compose stop` to stop all services from `docker-compose.yml`
- `$ docker-compose logs -f` to see the logs from all services in real time.
- `$ docker ps -a` to show all containers (services).
- The following steps are for cleaning up (clean re-installing / uninstalling):
  1. `$ docker-compose down`
  2. `$ docker system purge -a`

---

## Setting Up MariaDB
> To shorten the cover of the guide, please ask Google again on how to install MariaDB. (`how to install MariaDB on [Operating System]` should be enough :angeryCat:)

1. Assuming that the MariaDB server is already installed by this section, open the MariaDB CLI (`$ mysql`), login as root, and then execute each line— replace any text wrapped with `[]` with the credentials from the `auth.js`:
```sql
CREATE DATABASE `ramiel` CHARACTER SET = 'utf8mb4' COLLATE = 'utf8mb4_unicode_ci';
CREATE USER `ramiel`@`localhost` IDENTIFIED BY '[password in auth.js]';
GRANT ALL PRIVILEGES ON `ramiel`.* TO `ramiel`@`localhost`;
exit;
```

# License
> [**MIT**](https://github.com/gazmull/ramiel-bot/blob/master/LICENSE)
