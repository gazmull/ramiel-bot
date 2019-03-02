![what are you looking at](ramieru.png)
# Ramiel
- Built with [**Discord.JS-Akairo Framework** (**Master**)](https://github.com/1computer1/discord-akairo) and [**Discord.JS-Lavalink Client**](https://github.com/MrJacz/discord.js-lavalink)
    - [**Discord.JS-Akairo Documentation**](https://1computer1.github.io/discord-akairo/master)
    - [**Discord.JS-Lavalink Documentation**](https://mrjacz.github.io/discord.js-lavalink)
- Version: **0.1.0** (Private)
- [**Discord Server**](http://erosdev.thegzm.space)
- [**Bot Guide**](https://docs.thegzm.space/ramiel-bot) (N/A)

# Features
- Just a music bot, what else?

# Commands

# Self-Hosting
> The following items are required: [**Discord Bot Account**](https://github.com/reactiflux/discord-irc/wiki/Creating-a-discord-bot-&-getting-a-token), [**Yarn**](https://yarnpkg.com/en/docs/getting-started), [**JDK 11**](https://www.oracle.com/technetwork/java/javase/downloads/index.html) and [**Build Tools** (**Windows**)](https://github.com/felixrieseberg/windows-build-tools) | [**Build Tools** (**Linux**)](https://superuser.com/questions/352000/whats-a-good-way-to-install-build-essentials-all-common-useful-commands-on)

> **$** denotes it should be executed at a command shell.

1. `$ git clone https://github.com/gazmull/ramiel-bot.git && cd ramiel-bot`
2. Create an `auth.js` file and obtain the template from `auth.example.js`. The are documented by `// comments` to help set up the file.
3. Create a database at `provider` folder (create one) named `ramiel.db`.
    - For bash: `$ touch provider/ramiel.db`

## Installing Manually
1. Download [**Lavalink.jar**](https://ci.fredboat.com/viewLog.html?buildId=lastSuccessful&buildTypeId=Lavalink_Build&tab=artifacts&guest=1)
    - Place it to `server` folder (create one).
    - Create an `application.yml` file and obtain the template from `application.example.yml`.
2. `$ yarn && yarn run compile`
3. Run the server
    - `$ java -jar -Xmx512m server/Lavalink.jar`
        - `-Xmx[size]` denotes allocated memory for the application. 512M is optimal (at least for me).
4. Run the client (bot)
    - `$ node .`
    - Or from `.pm2.yml`: `$ pm2 start .pm2.yml --only ramiel-client --env production`

## Installing With Docker
1. Install [**Docker**](https://docker.com).
2. Optional: edit `docker-compose.yml` and `Dockerfile` according to your preferences. They're already set up properly so you need no worries if you skip this step.
    - Unlikely to be, but if it happens that you're hosting Ramiel as a big girl, you should increase the allocated memory on `Dockerfile-Lavalink` under CMD:
        - `CMD [ "java", "-jar", "-Xmx[Edit this one in particular. e.g: 2G for 2GB]", "server/Lavalink.jar" ]`
3. `$ docker-compose up`
    - Append `-d` if you want to leave the containers run in the background.

# License
> [MIT](LICENSE)
