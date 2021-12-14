import puppeteer from "puppeteer-extra";
import os from "os";

import pluginStealth from "puppeteer-extra-plugin-stealth";

puppeteer.use(pluginStealth());

const collSlug = "abstract-100-ai";
const openSeaCollPage = `https://opensea.io/collection/${collSlug}?search[sortAscending]=true&search[sortBy]=CREATED_DATE`;

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
    args: ["--no-sandbox", "--force-device-scale-factor=0.3"],
    userDataDir,
    ignoreDefaultArgs: ["--disable-extensions", "--enable-automation", "--mute-audio"],
  };
  const browser = await puppeteer.launch(options);
  const page = await browser.newPage();
  page.setDefaultTimeout(0);

  await page.setViewport({
    width: 5000,
    height: 6000,
    deviceScaleFactor: 0.1,
  });

  await page.goto(openSeaCollPage);
})();
