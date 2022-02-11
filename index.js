const { Client, Intents, MessageEmbed, Message, MessageAttachment } = require("discord.js");
const { getScreenshot } = require('./screenshot');
const puppeteer = require('puppeteer')

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

client.on('messageCreate', async (message) => {

  if (message.author.id === client.user.id)
    return;

  console.log(`Message received from ${message.author.username}.`);

  if (message.attachments.size <= 0) {
    console.log("It has no attachments.")
  }
  else {

    const browser = await puppeteer.launch();
    console.log(`It has ${message.attachments.size} attachments. Launching puppeteer...`)

    let validAttachments = message.attachments.filter(
      a => contentTypes[a.contentType] != undefined);
    console.log(`${validAttachments.size} valid attachments.`)
    let reply = {
      content: `Detected ${validAttachments.size} attachments`,
      embeds: [],
      files: []
    }

    await Promise.all(validAttachments.map(async (attachment) => {

      let embed = new MessageEmbed();

      console.log(` - ${attachment.name} (${attachment.contentType})`);

      if (contentTypes[attachment.contentType] != undefined) {

        let contentType = contentTypes[attachment.contentType];
        let data =
          await getScreenshot(
            browser,
            contentType.viewers[0].baseUrl.format(attachment.url),
            5
          );
        if (data != undefined)
          reply.files.push(data);

        embed.setFooter({
          text: contentType.type
        }).setTitle(attachment.name)
          .setURL(attachment.url)
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
    }));

    console.log('Closing puppeteer...')
    browser.close();

    if (validAttachments.size > 0) {
      message.reply(reply);
    }
  }
});

client.login(process.env.CLIPPY_TOKEN);
