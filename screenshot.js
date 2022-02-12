const puppeteer = require('puppeteer');

const waitTillHTMLRendered = async (page, timeout = 30000) => {
  const checkDurationMsecs = 1000;
  const maxChecks = timeout / checkDurationMsecs;
  let lastHTMLSize = 0;
  let checkCounts = 1;
  let countStableSizeIterations = 0;
  const minStableSizeIterations = 3;

  while (checkCounts++ <= maxChecks) {
    let html = await page.content();
    let currentHTMLSize = html.length;

    let bodyHTMLSize = await page.evaluate(() => document.body.innerHTML.length);

    console.log('last: ', lastHTMLSize, ' <> curr: ', currentHTMLSize, " body html size: ", bodyHTMLSize);

    if (lastHTMLSize != 0 && currentHTMLSize == lastHTMLSize)
      countStableSizeIterations++;
    else
      countStableSizeIterations = 0; //reset the counter

    if (countStableSizeIterations >= minStableSizeIterations) {
      console.log("Page rendered fully..");
      break;
    }

    lastHTMLSize = currentHTMLSize;
    await page.waitForTimeout(checkDurationMsecs);
  }
};

let getScreenshot = async (browser, url, attempts) => {

  async function r(url, attempts) {

    if (attempts === 0)
      return undefined;

    console.log('Attempting to take screenshot... ' +
      `${attempts} attempts remaining`)

    try {
      const page = await browser.newPage();
      console.log(`Going to ${url}`)
      await page.goto(url);
      console.log("Waiting for page to load...")
      await waitTillHTMLRendered(page);
      console.log("Taking screenshot...")
      const data = await page.screenshot();
      await page.close();
      return data;
    } catch {
      console.warn('Error trying again...')
      return await r(url, attempts - 1);
    }
  }

  return await r(url, attempts);

}

module.exports = {
  getScreenshot
}

