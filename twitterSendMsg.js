import SimpleNodeLogger from 'simple-node-logger';
import puppeteer from "puppeteer-extra";
import os from "os";
import path from 'path';
import fs from 'fs';
import chance from 'chance';

// this is just an array of your assets as objects
import db from "./db.js";

import pluginStealth from "puppeteer-extra-plugin-stealth";

puppeteer.use(pluginStealth());
 
if (!fs.existsSync('logs')){
    fs.mkdirSync('logs');
}

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



async function waitForSelectorElement(element, selector, timeout = 0) {
  const decTimeout = timeout > 0 ? (decValue) => (timeout -= decValue) : (decValue) => timeout;
  timeout = timeout > 0 ? timeout : 1;
  while (timeout > 0) {
    const el = element.$(selector);
    if (el) {
      return el;
    }
    await new Promise((r) => setTimeout(r, 100));
    decTimeout(100);
  }
  throw "timeout reached";
}

function createLogger(enableConsole, opts) {
    const manager = new SimpleNodeLogger(opts);
    if (enableConsole) {
      manager.createConsoleAppender(opts);
    }
    if (opts.logFilePath) {
      manager.createFileAppender(opts);
    }
    return manager.createLogger();
  }
  
const logger = createLogger(false, {
    logFilePath: path.join(path.resolve(), `logs/sendTwitterDm.log`),
    timestampFormat: 'YY-MM-DD HH:mm:ss.SSS',
  });

  

const goToTwitter = async () => {
    (async (_) => {  
    const osType = os.type();
    let executablePath, userDataDir;
    if (osType === "Windows_NT") {
      executablePath = `${os.homedir()}\\AppData\\Local\\Microsoft\\Edge SxS\\Application\\msedge.exe`;
      userDataDir = `${os.homedir()}\\AppData\\Local\\Microsoft\\Edge SxS\\User Data`;
    } else if (osType === "Linux") {
      executablePath = "/usr/bin/microsoft-edge-dev";
      userDataDir = "~/.config/microsoft-edge-dev";
    } else if ( osType === "Darwin") {
      executablePath = '/Volumes/Google Chrome Canary/Google Chrome Canary.app';
      userDataDir = '/Users/noahsolnick/Library/Application Support/Google/Chrome Canary/Default';
    }
    const options = {
      executablePath,
      headless: false,
      args: ["--no-sandbox"],
      userDataDir,
      ignoreDefaultArgs: ["--disable-extensions", "--enable-automation", "--mute-audio"],
    };
    let browser = null;
    while(browser === null) {
    try{
      browser = await puppeteer.launch(options);
    }catch(e){
      logger.error(e);
    }
  }
    const page = await browser.newPage();
    page.setDefaultTimeout(0);
    await page.goto("https://twitter.com");
})();
}


const sendTwitterMsg = (dbObj, delayBetweenMsg) => {
(async (_) => {  
  const osType = os.type();
  let executablePath, userDataDir;
  if (osType === "Windows_NT") {
    executablePath = `${os.homedir()}\\AppData\\Local\\Microsoft\\Edge SxS\\Application\\msedge.exe`;
    userDataDir = `${os.homedir()}\\AppData\\Local\\Microsoft\\Edge SxS\\User Data`;
  } else if (osType === "Linux") {
    executablePath = "/usr/bin/microsoft-edge-dev";
    userDataDir = "~/.config/microsoft-edge-dev";
  } else if ( osType === "Darwin") {
    executablePath = '/Volumes/Google Chrome Canary/Google Chrome Canary.app';
    userDataDir = '/Users/noahsolnick/Library/Application Support/Google/Chrome Canary/Default';
  }
  const options = {
    executablePath,
    headless: false,
    args: ["--no-sandbox"],
    userDataDir,
    ignoreDefaultArgs: ["--disable-extensions", "--enable-automation", "--mute-audio"],
  };
  let browser = null;
  while(browser === null) {
  try{
    browser = await puppeteer.launch(options);
  }catch(e){
    logger.error(e);
  }
}
  
  const page = await browser.newPage();
  page.setDefaultTimeout(0);


  for (const el of dbObj) {

  await page.goto("https://twitter.com/messages/compose");
  await page.waitForSelector("form input", {visible: true});
  await typeInInputElement(page, "form input", el[0]);
  const searchResult = await page.waitForSelector("form div:nth-child(2) > div > div:nth-child(2) > div > div", {visible: true});
  if(!searchResult){
    console.log(el[0] + ' twitter user not found');
    logger.warn(el[0] + ' twitter user not found');
  }else{
    // Need to wait a bit, otherwise react might not be ready to proces our click
    await page.waitForTimeout(650);
    await searchResult.click();
    let searchText = await page.evaluate(el => el.textContent, searchResult)
    if(searchText.includes('can’t be messaged')){
        console.log(el[0] + ' can’t be messaged');
        logger.warn(el[0] + ' can’t be messaged');
    continue; 
    }
    const nextButton = await page.waitForSelector('div[data-testid="nextButton"]', {visible: true});
    const waitForNavigation = page.waitForNavigation( { waitUntil: 'networkidle2' });
    await nextButton.click();
    await waitForNavigation;
    const msgBoxSelector = 'div[data-contents="true"] > div ';
    const msgBoxEl = await page.waitForSelector(msgBoxSelector, {visible: true});
    await msgBoxEl.click();
    await msgBoxEl.focus();
    await page.keyboard.type(el[1]);
    const sendBtn = await page.waitForSelector('div[aria-label="Send"]', {visible: true});
    await sendBtn.click();
    await page.waitForTimeout(150);
    logger.info(' sent message to ' + el[0]);
    await page.waitForTimeout(delayBetweenMsg);
  }
}
console.log('done');
})();

};

// goToTwitter()

// const dbObj = [
//     ["sobermurmur", "test2"],
//     ["sobermurmur", "test4"],
//     ["sobermurmur", "test5"],
//     ["sobermurmur", "test12"],
// ]

// sendTwitterMsg(dbObj, 300);