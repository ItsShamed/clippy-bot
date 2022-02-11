const puppeteer = require('puppeteer');

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
      await page.waitForNetworkIdle();
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

