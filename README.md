![what are you looking at](https://github.com/gazmull/ramiel-bot/blob/master/ramieru.png?raw=true)
# Ramiel
- Built with [**Discord.JS-Akairo Framework** (**Master**)](https://github.com/1computer1/discord-akairo) and [**Discord.JS-Lavalink Client**](https://github.com/MrJacz/discord.js-lavalink)
    - [**Discord.JS-Akairo Documentation**](https://1computer1.github.io/discord-akairo/master)
    - [**Discord.JS-Lavalink Documentation**](https://mrjacz.github.io/discord.js-lavalink)
- Version: **0.1.0**
- [**Discord Server**](http://erosdev.thegzm.space)
- [**Bot Guide**](https://docs.thegzm.space/ramiel-bot) (N/A)

# Features
- Just a music bot, what else?

# Commands

# Self-Hosting
> The following items are required: [**Discord Bot Account**](https://github.com/reactiflux/discord-irc/wiki/Creating-a-discord-bot-&-getting-a-token) and [**Docker-CE**](https://hub.docker.com/search/?type=edition&offering=community)

> This section assumes that the user has basic knowledge of workflow in his/her machine (e.g: how to run a command shell). If not then use everyone's bestfriend, Google, first.

> **$** denotes it should be executed at a command shell.

## Build from Source

1. `$ git clone https://github.com/gazmull/ramiel-bot.git ramiel && cd ramiel`
2. Create an `auth.js` file and obtain the template from [**auth.example.js**](https://github.com/gazmull/ramiel-bot/blob/master/auth.example.js).
3. Create an `application.yml` file and obtain the template from [**application.example.yml**](https://github.com/gazmull/ramiel-bot/blob/master/application.example.yml).
4. Optional: edit `docker-compose.yml` according to preferences, although it is already properly configured.
   - **!** - To disable automatic updates from [**gazmull/ramiel-bot**](http://dockerhub.com/r/gazmull/ramiel-bot), make sure to put the watchtower service in comments.
5. `$ docker-compose up -d`

## Pre-built
> This repository has a pre-built Docker image over here: [**gazmull/ramiel-bot**](http://dockerhub.com/r/gazmull/ramiel-bot)

1. Create a folder named `ramiel` and then do the following in it:
2. Create an `auth.js` file and obtain the template from [**auth.example.js**](https://github.com/gazmull/ramiel-bot/blob/master/auth.example.js).
3. Create an `application.yml` file and obtain the template from [**application.example.yml**](https://github.com/gazmull/ramiel-bot/blob/master/application.example.yml).
4. Create a `docker-compose.yml` file and obtain the template from [**docker-compose.yml**](https://github.com/gazmull/ramiel-bot/blob/master/docker-compose.yml).
   - Optional: edit `docker-compose.yml` according to preferences, although it is already properly configured.
     - **!** - To disable automatic updates from [**gazmull/ramiel-bot**](http://dockerhub.com/r/gazmull/ramiel-bot), make sure to put the watchtower service in comments.
6. `$ docker-compose up -d`

## Next Step
> This assumes that you're in the `ramiel` folder.

Here are some commands to execute while Ramiel's container is active:

- `$ docker-compose stop` to stop all services from `docker-compose.yml`
- `$ docker-compose logs -f` to see the logs from all services in real time.
- `$ docker ps -a` to show all containers (services).
- The following are for cleaning up (usually for clean re-installing or when getting rid of Ramiel):
    - `$ docker stop $(docker ps -a -q)`
    - `$ docker rmi $(docker images -q --filter "dangling=true")`
    - If the commands above does not completely erase unused containers, refer to this [**documentation**](https://www.digitalocean.com/community/tutorials/how-to-remove-docker-images-containers-and-volumes).
    - Last resort will be `$ docker system purge`

# License
> [MIT](https://github.com/gazmull/ramiel-bot/blob/master/LICENSE)
