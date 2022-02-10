const { Client, Intents } = require("discord.js");

const client = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES]
});

client.once('ready', () => {
  console.log('Bot is connected.');
});

client.on('messageCreate', (message) => {
  console.log(`Message received from ${message.author.username}.`);
  if (message.attachments.size <= 0) {
    console.log("It has no attachments.")
  }
  else {
    console.log(`It has ${message.attachments.size} attachments which are:`)
    message.attachments.forEach(attachments => {
      console.log(` - ${attachments.name} (${attachments.contentType})`)
    });
  }
});

client.login(process.env.CLIPPY_TOKEN);
