const { Client, Intents, MessageEmbed, Message } = require("discord.js");

const client = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES]
});

const contentTypes = require('./contentTypes.json');

String.prototype.format = function() {
  var args = arguments;
  return this.replace(/{([0-9]+)}/g, function(match, index) {
    return typeof args[index] == 'undefined' ? match : args[index];
  });
};


client.once('ready', () => {
  console.log('Bot is connected.');
});

client.on('messageCreate', (message) => {

  if (message.author.id === client.user.id)
    return;

  console.log(`Message received from ${message.author.username}.`);

  if (message.attachments.size <= 0) {
    console.log("It has no attachments.")
  }
  else {

    console.log(`It has ${message.attachments.size} attachments which are:`)

    let validAttachments = message.attachments.filter(
      a => contentTypes[a.contentType] != undefined);
    let reply = {
      content: `Detected ${validAttachments.size} attachments`,
      embeds: []
    }

    validAttachments.forEach(attachment => {

      let embed = new MessageEmbed();

      console.log(` - ${attachment.name} (${attachment.contentType})`);

      if (contentTypes[attachment.contentType] != undefined) {

        let contentType = contentTypes[attachment.contentType];

        embed.setFooter({
          text: contentType.type
        }).setTitle(attachment.name)
          .setDescription('Click the links below to open the file in your ' +
            'browser');

        contentType.viewers.forEach(viewer => {
          embed.addField(
            viewer.name,
            `[Click here](${viewer.baseUrl.format(attachment.url)})`,
            true
          );

        });
      }
      else {

      }
      reply.embeds.push(embed);
    });

    if (validAttachments.size > 0) {
      message.reply(reply);
    }
  }
});

client.login(process.env.CLIPPY_TOKEN);
