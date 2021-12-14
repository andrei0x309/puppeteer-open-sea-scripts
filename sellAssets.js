import puppeteer from "puppeteer-extra";
import os from "os";
import db from "./db.js";
import pluginStealth from "puppeteer-extra-plugin-stealth";
puppeteer.use(pluginStealth());

const openSeaPageBase = "https://opensea.io/assets/matic/0x2953399124f0cbb46d2cbacd8a89cf0599974963/";
const sellPrice = "0.002";

async function typeInInputElement(page, inputSelector, text) {
  await page.evaluate(
    (inputSelector, text) => {
      const inputElement = document.querySelector(inputSelector);
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
      nativeInputValueSetter.call(inputElement, text);

      const ev2 = new Event("input", { bubbles: true });
      inputElement.dispatchEvent(ev2);
    },
    inputSelector,
    text
  );
}

(async (_) => {
  // const browser = await puppeteer.launch(); // test
  const osType = os.type();
  let executablePath, userDataDir;
  if (osType === "Windows_NT") {
    executablePath = `${os.homedir()}\\AppData\\Local\\Microsoft\\Edge SxS\\Application\\msedge.exe`;
    userDataDir = `${os.homedir()}\\AppData\\Local\\Microsoft\\Edge SxS\\User Data`;
  } else if (osType === "Linux") {
    executablePath = "/usr/bin/microsoft-edge-dev";
    userDataDir = "~/.config/microsoft-edge-dev";
  }

  //  userDataDir: './tmp/chrome'
  const options = {
    executablePath,
    headless: false,
    args: ["--no-sandbox"],
    userDataDir,
    ignoreDefaultArgs: ["--disable-extensions", "--enable-automation", "--mute-audio"],
  };
  const browser = await puppeteer.launch(options);
  const page = await browser.newPage();
  page.setDefaultTimeout(0);

  const dbContinue = db;

  for (const el of dbContinue) {
    await page.goto(`${openSeaPageBase}${el.NFTId}/sell`);
    await page.waitForSelector("#price");
    // Set price
    await typeInInputElement(page, "#price", sellPrice);
    // Click for more details
    const moreDetails = await page.waitForSelector("form button:nth-child(4)");
    await moreDetails.click();
    // Click for sell period
    const periodBtn = await page.waitForSelector("form > div + div button");
    await periodBtn.click();
    const dateBtn = await page.waitForSelector("form > div + div > div > div > button + div input");
    await dateBtn.click();
    // 3 days
    const date3Days = await page.waitForSelector("form > div + div > div > div > button + div ul li + li");
    await date3Days.click();
    // Dismiss date modal
    await (await page.waitForSelector("h1")).click();

    // Click complete listing button
    const completeListingBtn = await page.waitForSelector("form button:nth-child(1)");
    await completeListingBtn.click();
    await page.waitForNavigation();
  }
})();
