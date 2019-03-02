module.exports = {
  // Your Discord Bot Account Token
  token: 'rusrs',
  // Your ID, get them from Discord's Developer Mode
  owner: '319102712383799296',
  // Default prefix along "ramiel, "
  prefix: 'r!',
  // Lavalink Nodes; default is from your application.yml
  nodes: [
      { host: '0.0.0.0', port: 2333, password: 'youshallnotpass' },
  ],
  // Your links; default is from the original bot
  supportLink: 'https://discord.gg/QTQCcah',
  inviteLink: 'http://addbot.thegzm.space',
  docs: 'https://docs.thegzm.space/ramiel-bot',
  // Emoji for dialogs like "searching..."; default is from Eros' Laboratory's loading Emoji
  emojis: {
    loading: '<a:aloading:550797435296022559>'
  }
};
