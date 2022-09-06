const { Client, Intents, MessageEmbed, Message, MessageAttachment } = require("discord.js");
const { getScreenshot } = require('./screenshot');
const puppeteer = require('puppeteer')
const https = require('https');
const axios = require('axios').default;

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


async function getFileType(uri) {
  try {
    return axios.head(uri).then(response => response.headers['content-type']);
  } catch (e) {
    return undefined;
  }
}

client.once('ready', () => {
  console.log('Bot is connected.');
});

client.on('messageCreate', async (message) => {

  console.log(message.content);
  console.log(typeof (message.content))

  if (message.author.id === client.user.id)
    return;

  console.log(`Message received from ${message.author.username}.`);

  let messageLinks = Array.from(message.content.matchAll(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/g), m => m[0]);
  console.log(`${messageLinks.length} links`)
  console.log(messageLinks);

  let linkContentTypes = {};

  // let validLinks = messageLinks.filter(l => {
  //   let isValid;
  //   https.get(l, resp => {

  //     if (contentTypes[resp.headers['content-type']] != undefined) {
  //       linkContentTypes.push({ [l]: resp.headers['content-type'] });
  //       return true;
  //     }
  //     return false;
  //   });
  //   return isValid;
  // })

  let validLinks = [];
  for (let link of messageLinks) {
    console.log(typeof (link));
    let type = await getFileType(link);
    if (contentTypes[type] != undefined) {
      validLinks.push(link);
      linkContentTypes[link] = type;
    };
  }

  console.log(`It has ${validLinks.length} valid links.`)
  validLinks.forEach(link => console.log(` - ${link}`))
  if (message.attachments.size <= 0 && validLinks.length <= 0) {
    console.log("It has no attachments.")
  }
  else {

    const browser = await puppeteer.launch({
      args: ['--disable-dev-shm-usage', '--no-sandbox'],
      executablePath: '/usr/bin/chromium'
    });
    console.log(`It has ${message.attachments.size} attachments. Launching puppeteer...`)

    message.attachments.forEach(attachment => {
      console.log(` - ${attachment.name} (${attachment.contentType})`);
    });

    let validAttachments = message.attachments.filter(
      a => contentTypes[a.contentType] != undefined);

    console.log(`${validAttachments.size} valid attachments.`)
    let reply = {
      content: `Detected ${validAttachments.size} attachments`
        + ` and ${validLinks.length} links`,
      embeds: [],
      files: []
    }

    await Promise.all(validAttachments.map(async (attachment) => {

      await message.channel.sendTyping();

      let embed = new MessageEmbed();


      if (contentTypes[attachment.contentType] != undefined) {

        let contentType = contentTypes[attachment.contentType];
        let data;

        try {
          data = await getScreenshot(
            browser,
            contentType.viewers[0].baseUrl.format(attachment.url),
            5
          );
        } catch (e) {
          console.error("Failed to get screenshot:");
          console.error(e);
          return;
        }

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
          reply.embeds.push(embed);
        });
      }
      else {

      }
    }));

    await Promise.all(validLinks.map(async (link) => {
      let embed = new MessageEmbed();

      if (contentTypes[linkContentTypes[link]] != undefined) {

        let contentType = contentTypes[linkContentTypes[link]];
        let data =
          await getScreenshot(
            browser,
            contentType.viewers[0].baseUrl.format(link),
            5
          );
        if (data != undefined)
          reply.files.push(data);

        embed.setFooter({
          text: contentType.type
        }).setTitle(link)
          .setURL(link)
          .setDescription('Click the links below to open the file in your ' +
            'browser');

        contentType.viewers.forEach(viewer => {
          embed.addField(
            viewer.name,
            `[Click here](${viewer.baseUrl.format(link)})`,
            true
          );

        });
        reply.embeds.push(embed);
      }
    }));

    console.log('Closing puppeteer...')
    browser.close();

    if (validAttachments.size > 0 || validLinks.length > 0) {
      message.reply(reply);
    }
  }
  console.log("Message handled");
});

client.login(process.env.CLIPPY_TOKEN);
