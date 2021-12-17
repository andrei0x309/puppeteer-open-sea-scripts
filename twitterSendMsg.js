import SimpleNodeLogger from 'simple-node-logger';
import puppeteer from "puppeteer-extra";
import os from "os";
import path from 'path';
import fs from 'fs';
import Chance from 'chance';
import clipboard from 'clipboardy';

// this is just an array of your assets as objects
//import db from "./db.js";

const chance = new Chance();

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
      executablePath = '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge';
      userDataDir = '/Users/noahsolnick/Library/Application Support/Microsoft Edge/Default';
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
    executablePath = '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge';
    userDataDir = '/Users/noahsolnick/Library/Application Support/Microsoft Edge/Default';
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
  let searchResult;
  try {
    searchResult = await page.waitForSelector("form div:nth-child(2) > div > div:nth-child(2) > div > div", {visible: true, timeout: 3000});
  }catch(err){
    searchResult = null
  }
  if(!searchResult){
    console.log(el[0] + ' twitter user not found');
    logger.warn(el[0] + ' twitter user not found');
  }else{
    // Need to wait a bit, otherwise react might not be ready to proces our click
    await page.waitForTimeout(2650);
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
    
    await clipboard.write(el[1])
    await msgBoxEl.click();
    await msgBoxEl.focus();
    
    await page.keyboard.down('Control')
    await page.keyboard.press('V')
    await page.keyboard.up('Control')
    const sendBtn = await page.waitForSelector('div[aria-label="Send"]', {visible: true});
    await sendBtn.click();
    await page.waitForTimeout(150);
    logger.info(' sent message to ' + el[0]);
    await page.waitForTimeout(chance.integer({min: 15, max: 35 }  * 1000));
  }
}
console.log('done');
})();

};

// goToTwitter()


const dbObj = [
  [
    'ZedekiahGraehl5',
    'Thanks for an amazing year of curating on Yup \n' +
      '\n' +
      '  As a gift, we made you a custom 1/1 NFT to commemorate your year on Yup 🎁'
  ],
  [
    'Whitney_020',
    'Thanks for an amazing year of curating on Yup \n' +
      '\n' +
      '  As a gift, we made you a custom 1/1 NFT to commemorate your year on Yup 🎁'
  ],
  [
    'SarahEveline_',
    'Thanks for an amazing year of curating on Yup \n' +
      '\n' +
      '  As a gift, we made you a custom 1/1 NFT to commemorate your year on Yup 🎁'
  ],
  [
    'apiskonyool',
    'Thanks for an amazing year of curating on Yup \n' +
      '\n' +
      '  As a gift, we made you a custom 1/1 NFT to commemorate your year on Yup 🎁'
  ],
  [
    'iqbal_prasetyo0',
    'Thanks for an amazing year of curating on Yup \n' +
      '\n' +
      '  As a gift, we made you a custom 1/1 NFT to commemorate your year on Yup 🎁'
  ],
  [
    'hanamaguka',
    'Thanks for an amazing year of curating on Yup \n' +
      '\n' +
      '  As a gift, we made you a custom 1/1 NFT to commemorate your year on Yup 🎁'
  ],
  [
    'Deny11587856',
    'Thanks for an amazing year of curating on Yup \n' +
      '\n' +
      '  As a gift, we made you a custom 1/1 NFT to commemorate your year on Yup 🎁'
  ],
  [
    'PakoCampo',
    'Thanks for an amazing year of curating on Yup \n' +
      '\n' +
      '  As a gift, we made you a custom 1/1 NFT to commemorate your year on Yup 🎁'
  ],
  [
    'andrei0x309',
    'Thanks for an amazing year of curating on Yup \n' +
      '\n' +
      '  As a gift, we made you a custom 1/1 NFT to commemorate your year on Yup 🎁'
  ],
  [
    '0xHarsh.wallet',
    'Thanks for an amazing year of curating on Yup \n' +
      '\n' +
      '  As a gift, we made you a custom 1/1 NFT to commemorate your year on Yup 🎁'
  ],
  [
    'toddsmithonline',
    'Thanks for an amazing year of curating on Yup \n' +
      '\n' +
      '  As a gift, we made you a custom 1/1 NFT to commemorate your year on Yup 🎁'
  ],
  [
    'PedroLuis1708',
    'Thanks for an amazing year of curating on Yup \n' +
      '\n' +
      '  As a gift, we made you a custom 1/1 NFT to commemorate your year on Yup 🎁'
  ],
  [
    'DyDiwani',
    'Thanks for an amazing year of curating on Yup \n' +
      '\n' +
      '  As a gift, we made you a custom 1/1 NFT to commemorate your year on Yup 🎁'
  ],
  [
    'leoncripto',
    'Thanks for an amazing year of curating on Yup \n' +
      '\n' +
      '  As a gift, we made you a custom 1/1 NFT to commemorate your year on Yup 🎁'
  ],
  [
    'ngelpuentes2',
    'Thanks for an amazing year of curating on Yup \n' +
      '\n' +
      '    As a gift, we made you a custom 1/1 NFT to commemorate your year on Yup \n' +
      '    \n' +
      '    Enjoy it: https://opensea.io/assets/matic/0x2953399124f0cbb46d2cbacd8a89cf0599974963/35103123611336801526804063328030384999994157736697582032169469750266854113281 \n' +
      '    Share it: https://twitter.com/intent/tweet?url=https://opensea.io/assets/matic/0x2953399124f0cbb46d2cbacd8a89cf0599974963/35103123611336801526804063328030384999994157736697582032169469750266854113281&text=Check%20out%20this%20sick%20Year%20on%20Yup%20NFT%20I%20got%20%40yup_io%20!!'
  ],
  [
    'CongoSerre',
    'Thanks for an amazing year of curating on Yup \n' +
      '\n' +
      '    As a gift, we made you a custom 1/1 NFT to commemorate your year on Yup \n' +
      '    \n' +
      '    Enjoy it: https://opensea.io/assets/matic/0x2953399124f0cbb46d2cbacd8a89cf0599974963/35103123611336801526804063328030384999994157736697582032169469754664900624385 \n' +
      '    Share it: https://twitter.com/intent/tweet?url=https://opensea.io/assets/matic/0x2953399124f0cbb46d2cbacd8a89cf0599974963/35103123611336801526804063328030384999994157736697582032169469754664900624385&text=Check%20out%20this%20sick%20Year%20on%20Yup%20NFT%20I%20got%20%40yup_io%20!!'
  ],
  [
    'javierleonxx',
    'Thanks for an amazing year of curating on Yup \n' +
      '\n' +
      '    As a gift, we made you a custom 1/1 NFT to commemorate your year on Yup \n' +
      '    \n' +
      '    Enjoy it: https://opensea.io/assets/matic/0x2953399124f0cbb46d2cbacd8a89cf0599974963/35103123611336801526804063328030384999994157736697582032169469756863923879937 \n' +
      '    Share it: https://twitter.com/intent/tweet?url=https://opensea.io/assets/matic/0x2953399124f0cbb46d2cbacd8a89cf0599974963/35103123611336801526804063328030384999994157736697582032169469756863923879937&text=Check%20out%20this%20sick%20Year%20on%20Yup%20NFT%20I%20got%20%40yup_io%20!!'
  ],
  [
    'Crypto_Manix',
    'Thanks for an amazing year of curating on Yup \n' +
      '\n' +
      '    As a gift, we made you a custom 1/1 NFT to commemorate your year on Yup \n' +
      '    \n' +
      '    Enjoy it: https://opensea.io/assets/matic/0x2953399124f0cbb46d2cbacd8a89cf0599974963/35103123611336801526804063328030384999994157736697582032169469755764412252161 \n' +
      '    Share it: https://twitter.com/intent/tweet?url=https://opensea.io/assets/matic/0x2953399124f0cbb46d2cbacd8a89cf0599974963/35103123611336801526804063328030384999994157736697582032169469755764412252161&text=Check%20out%20this%20sick%20Year%20on%20Yup%20NFT%20I%20got%20%40yup_io%20!!'
  ],
  [
    'Darkus0',
    'Thanks for an amazing year of curating on Yup \n' +
      '\n' +
      '    As a gift, we made you a custom 1/1 NFT to commemorate your year on Yup \n' +
      '    \n' +
      '    Enjoy it: https://opensea.io/assets/matic/0x2953399124f0cbb46d2cbacd8a89cf0599974963/35103123611336801526804063328030384999994157736697582032169469757963435507713 \n' +
      '    Share it: https://twitter.com/intent/tweet?url=https://opensea.io/assets/matic/0x2953399124f0cbb46d2cbacd8a89cf0599974963/35103123611336801526804063328030384999994157736697582032169469757963435507713&text=Check%20out%20this%20sick%20Year%20on%20Yup%20NFT%20I%20got%20%40yup_io%20!!'
  ],
  [
    'Franzzonline',
    'Thanks for an amazing year of curating on Yup \n' +
      '\n' +
      '    As a gift, we made you a custom 1/1 NFT to commemorate your year on Yup \n' +
      '    \n' +
      '    Enjoy it: https://opensea.io/assets/matic/0x2953399124f0cbb46d2cbacd8a89cf0599974963/35103123611336801526804063328030384999994157736697582032169469759062947135489 \n' +
      '    Share it: https://twitter.com/intent/tweet?url=https://opensea.io/assets/matic/0x2953399124f0cbb46d2cbacd8a89cf0599974963/35103123611336801526804063328030384999994157736697582032169469759062947135489&text=Check%20out%20this%20sick%20Year%20on%20Yup%20NFT%20I%20got%20%40yup_io%20!!'
  ],
  [
    'IanJeffreys1',
    'Thanks for an amazing year of curating on Yup \n' +
      '\n' +
      '    As a gift, we made you a custom 1/1 NFT to commemorate your year on Yup \n' +
      '    \n' +
      '    Enjoy it: https://opensea.io/assets/matic/0x2953399124f0cbb46d2cbacd8a89cf0599974963/35103123611336801526804063328030384999994157736697582032169469760162458763265 \n' +
      '    Share it: https://twitter.com/intent/tweet?url=https://opensea.io/assets/matic/0x2953399124f0cbb46d2cbacd8a89cf0599974963/35103123611336801526804063328030384999994157736697582032169469760162458763265&text=Check%20out%20this%20sick%20Year%20on%20Yup%20NFT%20I%20got%20%40yup_io%20!!'
  ],
  [
    'loresuly',
    'Thanks for an amazing year of curating on Yup \n' +
      '\n' +
      '    As a gift, we made you a custom 1/1 NFT to commemorate your year on Yup \n' +
      '    \n' +
      '    Enjoy it: https://opensea.io/assets/matic/0x2953399124f0cbb46d2cbacd8a89cf0599974963/35103123611336801526804063328030384999994157736697582032169469761261970391041 \n' +
      '    Share it: https://twitter.com/intent/tweet?url=https://opensea.io/assets/matic/0x2953399124f0cbb46d2cbacd8a89cf0599974963/35103123611336801526804063328030384999994157736697582032169469761261970391041&text=Check%20out%20this%20sick%20Year%20on%20Yup%20NFT%20I%20got%20%40yup_io%20!!'
  ],
  [
    'MrCartographer_',
    'Thanks for an amazing year of curating on Yup \n' +
      '\n' +
      '    As a gift, we made you a custom 1/1 NFT to commemorate your year on Yup \n' +
      '    \n' +
      '    Enjoy it: https://opensea.io/assets/matic/0x2953399124f0cbb46d2cbacd8a89cf0599974963/35103123611336801526804063328030384999994157736697582032169469762361482018817 \n' +
      '    Share it: https://twitter.com/intent/tweet?url=https://opensea.io/assets/matic/0x2953399124f0cbb46d2cbacd8a89cf0599974963/35103123611336801526804063328030384999994157736697582032169469762361482018817&text=Check%20out%20this%20sick%20Year%20on%20Yup%20NFT%20I%20got%20%40yup_io%20!!'
  ],
  [
    'NathanHeadPhoto',
    'Thanks for an amazing year of curating on Yup \n' +
      '\n' +
      '    As a gift, we made you a custom 1/1 NFT to commemorate your year on Yup \n' +
      '    \n' +
      '    Enjoy it: https://opensea.io/assets/matic/0x2953399124f0cbb46d2cbacd8a89cf0599974963/35103123611336801526804063328030384999994157736697582032169469763460993646593 \n' +
      '    Share it: https://twitter.com/intent/tweet?url=https://opensea.io/assets/matic/0x2953399124f0cbb46d2cbacd8a89cf0599974963/35103123611336801526804063328030384999994157736697582032169469763460993646593&text=Check%20out%20this%20sick%20Year%20on%20Yup%20NFT%20I%20got%20%40yup_io%20!!'
  ],
  [
    'Nimrud18',
    'Thanks for an amazing year of curating on Yup \n' +
      '\n' +
      '    As a gift, we made you a custom 1/1 NFT to commemorate your year on Yup \n' +
      '    \n' +
      '    Enjoy it: https://opensea.io/assets/matic/0x2953399124f0cbb46d2cbacd8a89cf0599974963/35103123611336801526804063328030384999994157736697582032169469764560505274369 \n' +
      '    Share it: https://twitter.com/intent/tweet?url=https://opensea.io/assets/matic/0x2953399124f0cbb46d2cbacd8a89cf0599974963/35103123611336801526804063328030384999994157736697582032169469764560505274369&text=Check%20out%20this%20sick%20Year%20on%20Yup%20NFT%20I%20got%20%40yup_io%20!!'
  ],
  [
    'noamlevenson',
    'Thanks for an amazing year of curating on Yup \n' +
      '\n' +
      '    As a gift, we made you a custom 1/1 NFT to commemorate your year on Yup \n' +
      '    \n' +
      '    Enjoy it: https://opensea.io/assets/matic/0x2953399124f0cbb46d2cbacd8a89cf0599974963/35103123611336801526804063328030384999994157736697582032169469765660016902145 \n' +
      '    Share it: https://twitter.com/intent/tweet?url=https://opensea.io/assets/matic/0x2953399124f0cbb46d2cbacd8a89cf0599974963/35103123611336801526804063328030384999994157736697582032169469765660016902145&text=Check%20out%20this%20sick%20Year%20on%20Yup%20NFT%20I%20got%20%40yup_io%20!!'
  ],
  [
    'PinkFlaminGucci',
    'Thanks for an amazing year of curating on Yup \n' +
      '\n' +
      '    As a gift, we made you a custom 1/1 NFT to commemorate your year on Yup \n' +
      '    \n' +
      '    Enjoy it: https://opensea.io/assets/matic/0x2953399124f0cbb46d2cbacd8a89cf0599974963/35103123611336801526804063328030384999994157736697582032169469767859040157697 \n' +
      '    Share it: https://twitter.com/intent/tweet?url=https://opensea.io/assets/matic/0x2953399124f0cbb46d2cbacd8a89cf0599974963/35103123611336801526804063328030384999994157736697582032169469767859040157697&text=Check%20out%20this%20sick%20Year%20on%20Yup%20NFT%20I%20got%20%40yup_io%20!!'
  ],
  [
    'pixellitist',
    'Thanks for an amazing year of curating on Yup \n' +
      '\n' +
      '    As a gift, we made you a custom 1/1 NFT to commemorate your year on Yup \n' +
      '    \n' +
      '    Enjoy it: https://opensea.io/assets/matic/0x2953399124f0cbb46d2cbacd8a89cf0599974963/35103123611336801526804063328030384999994157736697582032169469768958551785473 \n' +
      '    Share it: https://twitter.com/intent/tweet?url=https://opensea.io/assets/matic/0x2953399124f0cbb46d2cbacd8a89cf0599974963/35103123611336801526804063328030384999994157736697582032169469768958551785473&text=Check%20out%20this%20sick%20Year%20on%20Yup%20NFT%20I%20got%20%40yup_io%20!!'
  ],
  [
    'psicologiaexpre',
    'Thanks for an amazing year of curating on Yup \n' +
      '\n' +
      '    As a gift, we made you a custom 1/1 NFT to commemorate your year on Yup \n' +
      '    \n' +
      '    Enjoy it: https://opensea.io/assets/matic/0x2953399124f0cbb46d2cbacd8a89cf0599974963/35103123611336801526804063328030384999994157736697582032169469771157575041025 \n' +
      '    Share it: https://twitter.com/intent/tweet?url=https://opensea.io/assets/matic/0x2953399124f0cbb46d2cbacd8a89cf0599974963/35103123611336801526804063328030384999994157736697582032169469771157575041025&text=Check%20out%20this%20sick%20Year%20on%20Yup%20NFT%20I%20got%20%40yup_io%20!!'
  ],
  [
    'ScottCBusiness',
    'Thanks for an amazing year of curating on Yup \n' +
      '\n' +
      '    As a gift, we made you a custom 1/1 NFT to commemorate your year on Yup \n' +
      '    \n' +
      '    Enjoy it: https://opensea.io/assets/matic/0x2953399124f0cbb46d2cbacd8a89cf0599974963/35103123611336801526804063328030384999994157736697582032169469772257086668801 \n' +
      '    Share it: https://twitter.com/intent/tweet?url=https://opensea.io/assets/matic/0x2953399124f0cbb46d2cbacd8a89cf0599974963/35103123611336801526804063328030384999994157736697582032169469772257086668801&text=Check%20out%20this%20sick%20Year%20on%20Yup%20NFT%20I%20got%20%40yup_io%20!!'
  ],
  [
    'miguel_carax',
    'Thanks for an amazing year of curating on Yup \n' +
      '\n' +
      '    As a gift, we made you a custom 1/1 NFT to commemorate your year on Yup \n' +
      '    \n' +
      '    Enjoy it: https://opensea.io/assets/matic/0x2953399124f0cbb46d2cbacd8a89cf0599974963/35103123611336801526804063328030384999994157736697582032169469773356598296577 \n' +
      '    Share it: https://twitter.com/intent/tweet?url=https://opensea.io/assets/matic/0x2953399124f0cbb46d2cbacd8a89cf0599974963/35103123611336801526804063328030384999994157736697582032169469773356598296577&text=Check%20out%20this%20sick%20Year%20on%20Yup%20NFT%20I%20got%20%40yup_io%20!!'
  ],
  [
    'StrawberrySith',
    'Thanks for an amazing year of curating on Yup \n' +
      '\n' +
      '    As a gift, we made you a custom 1/1 NFT to commemorate your year on Yup \n' +
      '    \n' +
      '    Enjoy it: https://opensea.io/assets/matic/0x2953399124f0cbb46d2cbacd8a89cf0599974963/35103123611336801526804063328030384999994157736697582032169469774456109924353 \n' +
      '    Share it: https://twitter.com/intent/tweet?url=https://opensea.io/assets/matic/0x2953399124f0cbb46d2cbacd8a89cf0599974963/35103123611336801526804063328030384999994157736697582032169469774456109924353&text=Check%20out%20this%20sick%20Year%20on%20Yup%20NFT%20I%20got%20%40yup_io%20!!'
  ],
  [
    'TeslowMusic',
    'Thanks for an amazing year of curating on Yup \n' +
      '\n' +
      '    As a gift, we made you a custom 1/1 NFT to commemorate your year on Yup \n' +
      '    \n' +
      '    Enjoy it: https://opensea.io/assets/matic/0x2953399124f0cbb46d2cbacd8a89cf0599974963/35103123611336801526804063328030384999994157736697582032169469775555621552129 \n' +
      '    Share it: https://twitter.com/intent/tweet?url=https://opensea.io/assets/matic/0x2953399124f0cbb46d2cbacd8a89cf0599974963/35103123611336801526804063328030384999994157736697582032169469775555621552129&text=Check%20out%20this%20sick%20Year%20on%20Yup%20NFT%20I%20got%20%40yup_io%20!!'
  ],
  [
    'PuppyBunney',
    'Thanks for an amazing year of curating on Yup \n' +
      '\n' +
      '    As a gift, we made you a custom 1/1 NFT to commemorate your year on Yup \n' +
      '    \n' +
      '    Enjoy it: https://opensea.io/assets/matic/0x2953399124f0cbb46d2cbacd8a89cf0599974963/35103123611336801526804063328030384999994157736697582032169469777754644807681 \n' +
      '    Share it: https://twitter.com/intent/tweet?url=https://opensea.io/assets/matic/0x2953399124f0cbb46d2cbacd8a89cf0599974963/35103123611336801526804063328030384999994157736697582032169469777754644807681&text=Check%20out%20this%20sick%20Year%20on%20Yup%20NFT%20I%20got%20%40yup_io%20!!'
  ],
  [
    'todd3cr',
    'Thanks for an amazing year of curating on Yup \n' +
      '\n' +
      '    As a gift, we made you a custom 1/1 NFT to commemorate your year on Yup \n' +
      '    \n' +
      '    Enjoy it: https://opensea.io/assets/matic/0x2953399124f0cbb46d2cbacd8a89cf0599974963/35103123611336801526804063328030384999994157736697582032169469778854156435457 \n' +
      '    Share it: https://twitter.com/intent/tweet?url=https://opensea.io/assets/matic/0x2953399124f0cbb46d2cbacd8a89cf0599974963/35103123611336801526804063328030384999994157736697582032169469778854156435457&text=Check%20out%20this%20sick%20Year%20on%20Yup%20NFT%20I%20got%20%40yup_io%20!!'
  ],
  [
    'tomebendo',
    'Thanks for an amazing year of curating on Yup \n' +
      '\n' +
      '    As a gift, we made you a custom 1/1 NFT to commemorate your year on Yup \n' +
      '    \n' +
      '    Enjoy it: https://opensea.io/assets/matic/0x2953399124f0cbb46d2cbacd8a89cf0599974963/35103123611336801526804063328030384999994157736697582032169469779953668063233 \n' +
      '    Share it: https://twitter.com/intent/tweet?url=https://opensea.io/assets/matic/0x2953399124f0cbb46d2cbacd8a89cf0599974963/35103123611336801526804063328030384999994157736697582032169469779953668063233&text=Check%20out%20this%20sick%20Year%20on%20Yup%20NFT%20I%20got%20%40yup_io%20!!'
  ],
  [
    'TuchoThe',
    'Thanks for an amazing year of curating on Yup \n' +
      '\n' +
      '    As a gift, we made you a custom 1/1 NFT to commemorate your year on Yup \n' +
      '    \n' +
      '    Enjoy it: https://opensea.io/assets/matic/0x2953399124f0cbb46d2cbacd8a89cf0599974963/35103123611336801526804063328030384999994157736697582032169469781053179691009 \n' +
      '    Share it: https://twitter.com/intent/tweet?url=https://opensea.io/assets/matic/0x2953399124f0cbb46d2cbacd8a89cf0599974963/35103123611336801526804063328030384999994157736697582032169469781053179691009&text=Check%20out%20this%20sick%20Year%20on%20Yup%20NFT%20I%20got%20%40yup_io%20!!'
  ],
  [
    'Mahter1234',
    'Thanks for an amazing year of curating on Yup \n' +
      '\n' +
      '    As a gift, we made you a custom 1/1 NFT to commemorate your year on Yup \n' +
      '    \n' +
      '    Enjoy it: https://opensea.io/assets/matic/0x2953399124f0cbb46d2cbacd8a89cf0599974963/35103123611336801526804063328030384999994157736697582032169469782152691318785 \n' +
      '    Share it: https://twitter.com/intent/tweet?url=https://opensea.io/assets/matic/0x2953399124f0cbb46d2cbacd8a89cf0599974963/35103123611336801526804063328030384999994157736697582032169469782152691318785&text=Check%20out%20this%20sick%20Year%20on%20Yup%20NFT%20I%20got%20%40yup_io%20!!'
  ],
  [
    'xbrucethegoose',
    'Thanks for an amazing year of curating on Yup \n' +
      '\n' +
      '    As a gift, we made you a custom 1/1 NFT to commemorate your year on Yup \n' +
      '    \n' +
      '    Enjoy it: https://opensea.io/assets/matic/0x2953399124f0cbb46d2cbacd8a89cf0599974963/35103123611336801526804063328030384999994157736697582032169469783252202946561 \n' +
      '    Share it: https://twitter.com/intent/tweet?url=https://opensea.io/assets/matic/0x2953399124f0cbb46d2cbacd8a89cf0599974963/35103123611336801526804063328030384999994157736697582032169469783252202946561&text=Check%20out%20this%20sick%20Year%20on%20Yup%20NFT%20I%20got%20%40yup_io%20!!'
  ],
  [
    'Zeroshadow19',
    'Thanks for an amazing year of curating on Yup \n' +
      '\n' +
      '    As a gift, we made you a custom 1/1 NFT to commemorate your year on Yup \n' +
      '    \n' +
      '    Enjoy it: https://opensea.io/assets/matic/0x2953399124f0cbb46d2cbacd8a89cf0599974963/35103123611336801526804063328030384999994157736697582032169469848123388985345 \n' +
      '    Share it: https://twitter.com/intent/tweet?url=https://opensea.io/assets/matic/0x2953399124f0cbb46d2cbacd8a89cf0599974963/35103123611336801526804063328030384999994157736697582032169469848123388985345&text=Check%20out%20this%20sick%20Year%20on%20Yup%20NFT%20I%20got%20%40yup_io%20!!'
  ],
  [
    'Yuliiett',
    'Thanks for an amazing year of curating on Yup \n' +
      '\n' +
      '    As a gift, we made you a custom 1/1 NFT to commemorate your year on Yup \n' +
      '    \n' +
      '    Enjoy it: https://opensea.io/assets/matic/0x2953399124f0cbb46d2cbacd8a89cf0599974963/35103123611336801526804063328030384999994157736697582032169469845924365729793 \n' +
      '    Share it: https://twitter.com/intent/tweet?url=https://opensea.io/assets/matic/0x2953399124f0cbb46d2cbacd8a89cf0599974963/35103123611336801526804063328030384999994157736697582032169469845924365729793&text=Check%20out%20this%20sick%20Year%20on%20Yup%20NFT%20I%20got%20%40yup_io%20!!'
  ],
  [
    'Mahter1234',
    'Thanks for an amazing year of curating on Yup \n' +
      '\n' +
      '    As a gift, we made you a custom 1/1 NFT to commemorate your year on Yup \n' +
      '    \n' +
      '    Enjoy it: https://opensea.io/assets/matic/0x2953399124f0cbb46d2cbacd8a89cf0599974963/35103123611336801526804063328030384999994157736697582032169469842625830846465 \n' +
      '    Share it: https://twitter.com/intent/tweet?url=https://opensea.io/assets/matic/0x2953399124f0cbb46d2cbacd8a89cf0599974963/35103123611336801526804063328030384999994157736697582032169469842625830846465&text=Check%20out%20this%20sick%20Year%20on%20Yup%20NFT%20I%20got%20%40yup_io%20!!'
  ],
  [
    'VIVIANAVIVAS',
    'Thanks for an amazing year of curating on Yup \n' +
      '\n' +
      '    As a gift, we made you a custom 1/1 NFT to commemorate your year on Yup \n' +
      '    \n' +
      '    Enjoy it: https://opensea.io/assets/matic/0x2953399124f0cbb46d2cbacd8a89cf0599974963/35103123611336801526804063328030384999994157736697582032169469841526319218689 \n' +
      '    Share it: https://twitter.com/intent/tweet?url=https://opensea.io/assets/matic/0x2953399124f0cbb46d2cbacd8a89cf0599974963/35103123611336801526804063328030384999994157736697582032169469841526319218689&text=Check%20out%20this%20sick%20Year%20on%20Yup%20NFT%20I%20got%20%40yup_io%20!!'
  ],
  [
    'the_harsh_shah',
    'Thanks for an amazing year of curating on Yup \n' +
      '\n' +
      '    As a gift, we made you a custom 1/1 NFT to commemorate your year on Yup \n' +
      '    \n' +
      '    Enjoy it: https://opensea.io/assets/matic/0x2953399124f0cbb46d2cbacd8a89cf0599974963/35103123611336801526804063328030384999994157736697582032169469839327295963137 \n' +
      '    Share it: https://twitter.com/intent/tweet?url=https://opensea.io/assets/matic/0x2953399124f0cbb46d2cbacd8a89cf0599974963/35103123611336801526804063328030384999994157736697582032169469839327295963137&text=Check%20out%20this%20sick%20Year%20on%20Yup%20NFT%20I%20got%20%40yup_io%20!!'
  ],
  [
    'sauroman07',
    'Thanks for an amazing year of curating on Yup \n' +
      '\n' +
      '    As a gift, we made you a custom 1/1 NFT to commemorate your year on Yup \n' +
      '    \n' +
      '    Enjoy it: https://opensea.io/assets/matic/0x2953399124f0cbb46d2cbacd8a89cf0599974963/35103123611336801526804063328030384999994157736697582032169469836028761079809 \n' +
      '    Share it: https://twitter.com/intent/tweet?url=https://opensea.io/assets/matic/0x2953399124f0cbb46d2cbacd8a89cf0599974963/35103123611336801526804063328030384999994157736697582032169469836028761079809&text=Check%20out%20this%20sick%20Year%20on%20Yup%20NFT%20I%20got%20%40yup_io%20!!'
  ],
  [
    'RCYA89',
    'Thanks for an amazing year of curating on Yup \n' +
      '\n' +
      '    As a gift, we made you a custom 1/1 NFT to commemorate your year on Yup \n' +
      '    \n' +
      '    Enjoy it: https://opensea.io/assets/matic/0x2953399124f0cbb46d2cbacd8a89cf0599974963/35103123611336801526804063328030384999994157736697582032169469833829737824257 \n' +
      '    Share it: https://twitter.com/intent/tweet?url=https://opensea.io/assets/matic/0x2953399124f0cbb46d2cbacd8a89cf0599974963/35103123611336801526804063328030384999994157736697582032169469833829737824257&text=Check%20out%20this%20sick%20Year%20on%20Yup%20NFT%20I%20got%20%40yup_io%20!!'
  ],
  [
    'romerlpinto',
    'Thanks for an amazing year of curating on Yup \n' +
      '\n' +
      '    As a gift, we made you a custom 1/1 NFT to commemorate your year on Yup \n' +
      '    \n' +
      '    Enjoy it: https://opensea.io/assets/matic/0x2953399124f0cbb46d2cbacd8a89cf0599974963/35103123611336801526804063328030384999994157736697582032169469832730226196481 \n' +
      '    Share it: https://twitter.com/intent/tweet?url=https://opensea.io/assets/matic/0x2953399124f0cbb46d2cbacd8a89cf0599974963/35103123611336801526804063328030384999994157736697582032169469832730226196481&text=Check%20out%20this%20sick%20Year%20on%20Yup%20NFT%20I%20got%20%40yup_io%20!!'
  ],
  [
    'raseukiteuka',
    'Thanks for an amazing year of curating on Yup \n' +
      '\n' +
      '    As a gift, we made you a custom 1/1 NFT to commemorate your year on Yup \n' +
      '    \n' +
      '    Enjoy it: https://opensea.io/assets/matic/0x2953399124f0cbb46d2cbacd8a89cf0599974963/35103123611336801526804063328030384999994157736697582032169469831630714568705 \n' +
      '    Share it: https://twitter.com/intent/tweet?url=https://opensea.io/assets/matic/0x2953399124f0cbb46d2cbacd8a89cf0599974963/35103123611336801526804063328030384999994157736697582032169469831630714568705&text=Check%20out%20this%20sick%20Year%20on%20Yup%20NFT%20I%20got%20%40yup_io%20!!'
  ],
  [
    'psicologiaexpre',
    'Thanks for an amazing year of curating on Yup \n' +
      '\n' +
      '    As a gift, we made you a custom 1/1 NFT to commemorate your year on Yup \n' +
      '    \n' +
      '    Enjoy it: https://opensea.io/assets/matic/0x2953399124f0cbb46d2cbacd8a89cf0599974963/35103123611336801526804063328030384999994157736697582032169469831630714568705 \n' +
      '    Share it: https://twitter.com/intent/tweet?url=https://opensea.io/assets/matic/0x2953399124f0cbb46d2cbacd8a89cf0599974963/35103123611336801526804063328030384999994157736697582032169469831630714568705&text=Check%20out%20this%20sick%20Year%20on%20Yup%20NFT%20I%20got%20%40yup_io%20!!'
  ],
  [
    'NStatoshi',
    'Thanks for an amazing year of curating on Yup \n' +
      '\n' +
      '    As a gift, we made you a custom 1/1 NFT to commemorate your year on Yup \n' +
      '    \n' +
      '    Enjoy it: https://opensea.io/assets/matic/0x2953399124f0cbb46d2cbacd8a89cf0599974963/35103123611336801526804063328030384999994157736697582032169469828332179685377 \n' +
      '    Share it: https://twitter.com/intent/tweet?url=https://opensea.io/assets/matic/0x2953399124f0cbb46d2cbacd8a89cf0599974963/35103123611336801526804063328030384999994157736697582032169469828332179685377&text=Check%20out%20this%20sick%20Year%20on%20Yup%20NFT%20I%20got%20%40yup_io%20!!'
  ],
  [
    'musiden',
    'Thanks for an amazing year of curating on Yup \n' +
      '\n' +
      '    As a gift, we made you a custom 1/1 NFT to commemorate your year on Yup \n' +
      '    \n' +
      '    Enjoy it: https://opensea.io/assets/matic/0x2953399124f0cbb46d2cbacd8a89cf0599974963/35103123611336801526804063328030384999994157736697582032169469826133156429825 \n' +
      '    Share it: https://twitter.com/intent/tweet?url=https://opensea.io/assets/matic/0x2953399124f0cbb46d2cbacd8a89cf0599974963/35103123611336801526804063328030384999994157736697582032169469826133156429825&text=Check%20out%20this%20sick%20Year%20on%20Yup%20NFT%20I%20got%20%40yup_io%20!!'
  ],
  [
    'ManuelE00528210',
    'Thanks for an amazing year of curating on Yup \n' +
      '\n' +
      '    As a gift, we made you a custom 1/1 NFT to commemorate your year on Yup \n' +
      '    \n' +
      '    Enjoy it: https://opensea.io/assets/matic/0x2953399124f0cbb46d2cbacd8a89cf0599974963/35103123611336801526804063328030384999994157736697582032169469823934133174273 \n' +
      '    Share it: https://twitter.com/intent/tweet?url=https://opensea.io/assets/matic/0x2953399124f0cbb46d2cbacd8a89cf0599974963/35103123611336801526804063328030384999994157736697582032169469823934133174273&text=Check%20out%20this%20sick%20Year%20on%20Yup%20NFT%20I%20got%20%40yup_io%20!!'
  ],
  [
    'mayrabei',
    'Thanks for an amazing year of curating on Yup \n' +
      '\n' +
      '    As a gift, we made you a custom 1/1 NFT to commemorate your year on Yup \n' +
      '    \n' +
      '    Enjoy it: https://opensea.io/assets/matic/0x2953399124f0cbb46d2cbacd8a89cf0599974963/35103123611336801526804063328030384999994157736697582032169469748067830857768 \n' +
      '    Share it: https://twitter.com/intent/tweet?url=https://opensea.io/assets/matic/0x2953399124f0cbb46d2cbacd8a89cf0599974963/35103123611336801526804063328030384999994157736697582032169469748067830857768&text=Check%20out%20this%20sick%20Year%20on%20Yup%20NFT%20I%20got%20%40yup_io%20!!'
  ],
  [
    'artis_asora996',
    'Thanks for an amazing year of curating on Yup \n' +
      '\n' +
      '    As a gift, we made you a custom 1/1 NFT to commemorate your year on Yup \n' +
      '    \n' +
      '    Enjoy it: https://opensea.io/assets/matic/0x2953399124f0cbb46d2cbacd8a89cf0599974963/35103123611336801526804063328030384999994157736697582032169469748067830857768 \n' +
      '    Share it: https://twitter.com/intent/tweet?url=https://opensea.io/assets/matic/0x2953399124f0cbb46d2cbacd8a89cf0599974963/35103123611336801526804063328030384999994157736697582032169469748067830857768&text=Check%20out%20this%20sick%20Year%20on%20Yup%20NFT%20I%20got%20%40yup_io%20!!'
  ],
  [
    'Griais',
    'Thanks for an amazing year of curating on Yup \n' +
      '\n' +
      '    As a gift, we made you a custom 1/1 NFT to commemorate your year on Yup \n' +
      '    \n' +
      '    Enjoy it: https://opensea.io/assets/matic/0x2953399124f0cbb46d2cbacd8a89cf0599974963/35103123611336801526804063328030384999994157736697582032169469748067830857768 \n' +
      '    Share it: https://twitter.com/intent/tweet?url=https://opensea.io/assets/matic/0x2953399124f0cbb46d2cbacd8a89cf0599974963/35103123611336801526804063328030384999994157736697582032169469748067830857768&text=Check%20out%20this%20sick%20Year%20on%20Yup%20NFT%20I%20got%20%40yup_io%20!!'
  ],
  [
    'luzcar8516',
    'Thanks for an amazing year of curating on Yup \n' +
      '\n' +
      '    As a gift, we made you a custom 1/1 NFT to commemorate your year on Yup \n' +
      '    \n' +
      '    Enjoy it: https://opensea.io/assets/matic/0x2953399124f0cbb46d2cbacd8a89cf0599974963/35103123611336801526804063328030384999994157736697582032169469748067830857768 \n' +
      '    Share it: https://twitter.com/intent/tweet?url=https://opensea.io/assets/matic/0x2953399124f0cbb46d2cbacd8a89cf0599974963/35103123611336801526804063328030384999994157736697582032169469748067830857768&text=Check%20out%20this%20sick%20Year%20on%20Yup%20NFT%20I%20got%20%40yup_io%20!!'
  ],
  [
    'LeycelSequera',
    'Thanks for an amazing year of curating on Yup \n' +
      '\n' +
      '    As a gift, we made you a custom 1/1 NFT to commemorate your year on Yup \n' +
      '    \n' +
      '    Enjoy it: https://opensea.io/assets/matic/0x2953399124f0cbb46d2cbacd8a89cf0599974963/35103123611336801526804063328030384999994157736697582032169469748067830857768 \n' +
      '    Share it: https://twitter.com/intent/tweet?url=https://opensea.io/assets/matic/0x2953399124f0cbb46d2cbacd8a89cf0599974963/35103123611336801526804063328030384999994157736697582032169469748067830857768&text=Check%20out%20this%20sick%20Year%20on%20Yup%20NFT%20I%20got%20%40yup_io%20!!'
  ],
  [
    'Juraganja_',
    'Thanks for an amazing year of curating on Yup \n' +
      '\n' +
      '    As a gift, we made you a custom 1/1 NFT to commemorate your year on Yup \n' +
      '    \n' +
      '    Enjoy it: https://opensea.io/assets/matic/0x2953399124f0cbb46d2cbacd8a89cf0599974963/35103123611336801526804063328030384999994157736697582032169469748067830857768 \n' +
      '    Share it: https://twitter.com/intent/tweet?url=https://opensea.io/assets/matic/0x2953399124f0cbb46d2cbacd8a89cf0599974963/35103123611336801526804063328030384999994157736697582032169469748067830857768&text=Check%20out%20this%20sick%20Year%20on%20Yup%20NFT%20I%20got%20%40yup_io%20!!'
  ],
  [
    'GinaHer47323285',
    'Thanks for an amazing year of curating on Yup \n' +
      '\n' +
      '    As a gift, we made you a custom 1/1 NFT to commemorate your year on Yup \n' +
      '    \n' +
      '    Enjoy it: https://opensea.io/assets/matic/0x2953399124f0cbb46d2cbacd8a89cf0599974963/35103123611336801526804063328030384999994157736697582032169469806341947129857 \n' +
      '    Share it: https://twitter.com/intent/tweet?url=https://opensea.io/assets/matic/0x2953399124f0cbb46d2cbacd8a89cf0599974963/35103123611336801526804063328030384999994157736697582032169469806341947129857&text=Check%20out%20this%20sick%20Year%20on%20Yup%20NFT%20I%20got%20%40yup_io%20!!'
  ],
  [
    'Franzzonline',
    'Thanks for an amazing year of curating on Yup \n' +
      '\n' +
      '    As a gift, we made you a custom 1/1 NFT to commemorate your year on Yup \n' +
      '    \n' +
      '    Enjoy it: https://opensea.io/assets/matic/0x2953399124f0cbb46d2cbacd8a89cf0599974963/35103123611336801526804063328030384999994157736697582032169469804142923874305 \n' +
      '    Share it: https://twitter.com/intent/tweet?url=https://opensea.io/assets/matic/0x2953399124f0cbb46d2cbacd8a89cf0599974963/35103123611336801526804063328030384999994157736697582032169469804142923874305&text=Check%20out%20this%20sick%20Year%20on%20Yup%20NFT%20I%20got%20%40yup_io%20!!'
  ],
  [
    'Guiller85600864',
    'Thanks for an amazing year of curating on Yup \n' +
      '\n' +
      '    As a gift, we made you a custom 1/1 NFT to commemorate your year on Yup \n' +
      '    \n' +
      '    Enjoy it: https://opensea.io/assets/matic/0x2953399124f0cbb46d2cbacd8a89cf0599974963/35103123611336801526804063328030384999994157736697582032169469803043412246529 \n' +
      '    Share it: https://twitter.com/intent/tweet?url=https://opensea.io/assets/matic/0x2953399124f0cbb46d2cbacd8a89cf0599974963/35103123611336801526804063328030384999994157736697582032169469803043412246529&text=Check%20out%20this%20sick%20Year%20on%20Yup%20NFT%20I%20got%20%40yup_io%20!!'
  ],
  [
    'ArangurenDoris',
    'Thanks for an amazing year of curating on Yup \n' +
      '\n' +
      '    As a gift, we made you a custom 1/1 NFT to commemorate your year on Yup \n' +
      '    \n' +
      '    Enjoy it: https://opensea.io/assets/matic/0x2953399124f0cbb46d2cbacd8a89cf0599974963/35103123611336801526804063328030384999994157736697582032169469800844388990977 \n' +
      '    Share it: https://twitter.com/intent/tweet?url=https://opensea.io/assets/matic/0x2953399124f0cbb46d2cbacd8a89cf0599974963/35103123611336801526804063328030384999994157736697582032169469800844388990977&text=Check%20out%20this%20sick%20Year%20on%20Yup%20NFT%20I%20got%20%40yup_io%20!!'
  ],
  [
    'darren_yupio',
    'Thanks for an amazing year of curating on Yup \n' +
      '\n' +
      '    As a gift, we made you a custom 1/1 NFT to commemorate your year on Yup \n' +
      '    \n' +
      '    Enjoy it: https://opensea.io/assets/matic/0x2953399124f0cbb46d2cbacd8a89cf0599974963/35103123611336801526804063328030384999994157736697582032169469798645365735425 \n' +
      '    Share it: https://twitter.com/intent/tweet?url=https://opensea.io/assets/matic/0x2953399124f0cbb46d2cbacd8a89cf0599974963/35103123611336801526804063328030384999994157736697582032169469798645365735425&text=Check%20out%20this%20sick%20Year%20on%20Yup%20NFT%20I%20got%20%40yup_io%20!!'
  ],
  [
    'CristinaBeix',
    'Thanks for an amazing year of curating on Yup \n' +
      '\n' +
      '    As a gift, we made you a custom 1/1 NFT to commemorate your year on Yup \n' +
      '    \n' +
      '    Enjoy it: https://opensea.io/assets/matic/0x2953399124f0cbb46d2cbacd8a89cf0599974963/35103123611336801526804063328030384999994157736697582032169469795346830852097 \n' +
      '    Share it: https://twitter.com/intent/tweet?url=https://opensea.io/assets/matic/0x2953399124f0cbb46d2cbacd8a89cf0599974963/35103123611336801526804063328030384999994157736697582032169469795346830852097&text=Check%20out%20this%20sick%20Year%20on%20Yup%20NFT%20I%20got%20%40yup_io%20!!'
  ],
  [
    'Chenita847',
    'Thanks for an amazing year of curating on Yup \n' +
      '\n' +
      '    As a gift, we made you a custom 1/1 NFT to commemorate your year on Yup \n' +
      '    \n' +
      '    Enjoy it: https://opensea.io/assets/matic/0x2953399124f0cbb46d2cbacd8a89cf0599974963/35103123611336801526804063328030384999994157736697582032169469794247319224321 \n' +
      '    Share it: https://twitter.com/intent/tweet?url=https://opensea.io/assets/matic/0x2953399124f0cbb46d2cbacd8a89cf0599974963/35103123611336801526804063328030384999994157736697582032169469794247319224321&text=Check%20out%20this%20sick%20Year%20on%20Yup%20NFT%20I%20got%20%40yup_io%20!!'
  ],
  [
    'Blackjack1323',
    'Thanks for an amazing year of curating on Yup \n' +
      '\n' +
      '    As a gift, we made you a custom 1/1 NFT to commemorate your year on Yup \n' +
      '    \n' +
      '    Enjoy it: https://opensea.io/assets/matic/0x2953399124f0cbb46d2cbacd8a89cf0599974963/35103123611336801526804063328030384999994157736697582032169469792048295968769 \n' +
      '    Share it: https://twitter.com/intent/tweet?url=https://opensea.io/assets/matic/0x2953399124f0cbb46d2cbacd8a89cf0599974963/35103123611336801526804063328030384999994157736697582032169469792048295968769&text=Check%20out%20this%20sick%20Year%20on%20Yup%20NFT%20I%20got%20%40yup_io%20!!'
  ],
  [
    'msumbahar',
    'Thanks for an amazing year of curating on Yup \n' +
      '\n' +
      '    As a gift, we made you a custom 1/1 NFT to commemorate your year on Yup \n' +
      '    \n' +
      '    Enjoy it: https://opensea.io/assets/matic/0x2953399124f0cbb46d2cbacd8a89cf0599974963/35103123611336801526804063328030384999994157736697582032169469790948784340993 \n' +
      '    Share it: https://twitter.com/intent/tweet?url=https://opensea.io/assets/matic/0x2953399124f0cbb46d2cbacd8a89cf0599974963/35103123611336801526804063328030384999994157736697582032169469790948784340993&text=Check%20out%20this%20sick%20Year%20on%20Yup%20NFT%20I%20got%20%40yup_io%20!!'
  ],
  [
    'b19bay',
    'Thanks for an amazing year of curating on Yup \n' +
      '\n' +
      '    As a gift, we made you a custom 1/1 NFT to commemorate your year on Yup \n' +
      '    \n' +
      '    Enjoy it: https://opensea.io/assets/matic/0x2953399124f0cbb46d2cbacd8a89cf0599974963/35103123611336801526804063328030384999994157736697582032169469789849272713217 \n' +
      '    Share it: https://twitter.com/intent/tweet?url=https://opensea.io/assets/matic/0x2953399124f0cbb46d2cbacd8a89cf0599974963/35103123611336801526804063328030384999994157736697582032169469789849272713217&text=Check%20out%20this%20sick%20Year%20on%20Yup%20NFT%20I%20got%20%40yup_io%20!!'
  ],
  [
    'ATAGATA20',
    'Thanks for an amazing year of curating on Yup \n' +
      '\n' +
      '    As a gift, we made you a custom 1/1 NFT to commemorate your year on Yup \n' +
      '    \n' +
      '    Enjoy it: https://opensea.io/assets/matic/0x2953399124f0cbb46d2cbacd8a89cf0599974963/35103123611336801526804063328030384999994157736697582032169469788749761085441 \n' +
      '    Share it: https://twitter.com/intent/tweet?url=https://opensea.io/assets/matic/0x2953399124f0cbb46d2cbacd8a89cf0599974963/35103123611336801526804063328030384999994157736697582032169469788749761085441&text=Check%20out%20this%20sick%20Year%20on%20Yup%20NFT%20I%20got%20%40yup_io%20!!'
  ],
  [
    'AguaSan88156958',
    'Thanks for an amazing year of curating on Yup \n' +
      '\n' +
      '    As a gift, we made you a custom 1/1 NFT to commemorate your year on Yup \n' +
      '    \n' +
      '    Enjoy it: https://opensea.io/assets/matic/0x2953399124f0cbb46d2cbacd8a89cf0599974963/35103123611336801526804063328030384999994157736697582032169469785451226202113 \n' +
      '    Share it: https://twitter.com/intent/tweet?url=https://opensea.io/assets/matic/0x2953399124f0cbb46d2cbacd8a89cf0599974963/35103123611336801526804063328030384999994157736697582032169469785451226202113&text=Check%20out%20this%20sick%20Year%20on%20Yup%20NFT%20I%20got%20%40yup_io%20!!'
  ],
  [
    'Darkus0',
    'Thanks for an amazing year of curating on Yup \n' +
      '\n' +
      '    As a gift, we made you a custom 1/1 NFT to commemorate your year on Yup \n' +
      '    \n' +
      '    Enjoy it: https://opensea.io/assets/matic/0x2953399124f0cbb46d2cbacd8a89cf0599974963/351031236113368015268040633280303849999941577366975820321694697480678308577688 \n' +        
      '    Share it: https://twitter.com/intent/tweet?url=https://opensea.io/assets/matic/0x2953399124f0cbb46d2cbacd8a89cf0599974963/35103123611336801526804063328030384999994157736697582032169469748067830857768&text=Check%20out%20this%20sick%20Year%20on%20Yup%20NFT%20I%20got%20%40yup_io%20!!'
  ],
  [
    'Franzzonline',
    'Thanks for an amazing year of curating on Yup \n' +
      '\n' +
      '    As a gift, we made you a custom 1/1 NFT to commemorate your year on Yup \n' +
      '    \n' +
      '    Enjoy it: https://opensea.io/assets/matic/0x2953399124f0cbb46d2cbacd8a89cf0599974963/351031236113368015268040633280303849999941577366975820321694697480678308577688 \n' +        
      '    Share it: https://twitter.com/intent/tweet?url=https://opensea.io/assets/matic/0x2953399124f0cbb46d2cbacd8a89cf0599974963/35103123611336801526804063328030384999994157736697582032169469748067830857768&text=Check%20out%20this%20sick%20Year%20on%20Yup%20NFT%20I%20got%20%40yup_io%20!!'
  ],
  [
    'RussBear_lol',
    'Thanks for an amazing year of curating on Yup \n' +
      '\n' +
      '    As a gift, we made you a custom 1/1 NFT to commemorate your year on Yup \n' +
      '    \n' +
      '    Enjoy it: https://opensea.io/assets/matic/0x2953399124f0cbb46d2cbacd8a89cf0599974963/35103123611336801526804063328030384999994157736697582032169469748067830857735 \n' +
      '    Share it: https://twitter.com/intent/tweet?url=https://opensea.io/assets/matic/0x2953399124f0cbb46d2cbacd8a89cf0599974963/35103123611336801526804063328030384999994157736697582032169469748067830857735&text=Check%20out%20this%20sick%20Year%20on%20Yup%20NFT%20I%20got%20%40yup_io%20!!'
  ],
  [
    'Inter_netMoney',
    'Thanks for an amazing year of curating on Yup \n' +
      '\n' +
      '    As a gift, we made you a custom 1/1 NFT to commemorate your year on Yup \n' +
      '    \n' +
      '    Enjoy it: https://opensea.io/assets/matic/0x2953399124f0cbb46d2cbacd8a89cf0599974963/35103123611336801526804063328030384999994157736697582032169469748067830857737 \n' +
      '    Share it: https://twitter.com/intent/tweet?url=https://opensea.io/assets/matic/0x2953399124f0cbb46d2cbacd8a89cf0599974963/35103123611336801526804063328030384999994157736697582032169469748067830857737&text=Check%20out%20this%20sick%20Year%20on%20Yup%20NFT%20I%20got%20%40yup_io%20!!'
  ],
  [
    'IgrTsvetkov',
    'Thanks for an amazing year of curating on Yup \n' +
      '\n' +
      '    As a gift, we made you a custom 1/1 NFT to commemorate your year on Yup \n' +
      '    \n' +
      '    Enjoy it: https://opensea.io/assets/matic/0x2953399124f0cbb46d2cbacd8a89cf0599974963/35103123611336801526804063328030384999994157736697582032169469748067830857741 \n' +
      '    Share it: https://twitter.com/intent/tweet?url=https://opensea.io/assets/matic/0x2953399124f0cbb46d2cbacd8a89cf0599974963/35103123611336801526804063328030384999994157736697582032169469748067830857741&text=Check%20out%20this%20sick%20Year%20on%20Yup%20NFT%20I%20got%20%40yup_io%20!!'
  ],
  [
    'abcxd15',
    'Thanks for an amazing year of curating on Yup \n' +
      '\n' +
      '    As a gift, we made you a custom 1/1 NFT to commemorate your year on Yup \n' +
      '    \n' +
      '    Enjoy it: https://opensea.io/assets/matic/0x2953399124f0cbb46d2cbacd8a89cf0599974963/35103123611336801526804063328030384999994157736697582032169469748067830857745 \n' +
      '    Share it: https://twitter.com/intent/tweet?url=https://opensea.io/assets/matic/0x2953399124f0cbb46d2cbacd8a89cf0599974963/35103123611336801526804063328030384999994157736697582032169469748067830857745&text=Check%20out%20this%20sick%20Year%20on%20Yup%20NFT%20I%20got%20%40yup_io%20!!'
  ],
  [
    'PuppyBunney',
    'Thanks for an amazing year of curating on Yup \n' +
      '\n' +
      '    As a gift, we made you a custom 1/1 NFT to commemorate your year on Yup \n' +
      '    \n' +
      '    Enjoy it: https://opensea.io/assets/matic/0x2953399124f0cbb46d2cbacd8a89cf0599974963/35103123611336801526804063328030384999994157736697582032169469748067830857768 \n' +
      '    Share it: https://twitter.com/intent/tweet?url=https://opensea.io/assets/matic/0x2953399124f0cbb46d2cbacd8a89cf0599974963/35103123611336801526804063328030384999994157736697582032169469748067830857768&text=Check%20out%20this%20sick%20Year%20on%20Yup%20NFT%20I%20got%20%40yup_io%20!!'
  ],
  [
    'javierleonxx',
    'Thanks for an amazing year of curating on Yup \n' +
      '\n' +
      '    As a gift, we made you a custom 1/1 NFT to commemorate your year on Yup \n' +
      '    \n' +
      '    Enjoy it: https://opensea.io/assets/matic/0x2953399124f0cbb46d2cbacd8a89cf0599974963/35103123611336801526804063328030384999994157736697582032169469748067830857768 \n' +
      '    Share it: https://twitter.com/intent/tweet?url=https://opensea.io/assets/matic/0x2953399124f0cbb46d2cbacd8a89cf0599974963/35103123611336801526804063328030384999994157736697582032169469748067830857768&text=Check%20out%20this%20sick%20Year%20on%20Yup%20NFT%20I%20got%20%40yup_io%20!!'
  ],
  [
    'psicologiaexpre',
    'Thanks for an amazing year of curating on Yup \n' +
      '\n' +
      '    As a gift, we made you a custom 1/1 NFT to commemorate your year on Yup \n' +
      '    \n' +
      '    Enjoy it: https://opensea.io/assets/matic/0x2953399124f0cbb46d2cbacd8a89cf0599974963/35103123611336801526804063328030384999994157736697582032169469748067830857768 \n' +
      '    Share it: https://twitter.com/intent/tweet?url=https://opensea.io/assets/matic/0x2953399124f0cbb46d2cbacd8a89cf0599974963/35103123611336801526804063328030384999994157736697582032169469748067830857768&text=Check%20out%20this%20sick%20Year%20on%20Yup%20NFT%20I%20got%20%40yup_io%20!!'
  ],
  [
    'Crypto_Manix',
    'Thanks for an amazing year of curating on Yup \n' +
      '\n' +
      '    As a gift, we made you a custom 1/1 NFT to commemorate your year on Yup \n' +
      '    \n' +
      '    Enjoy it: https://opensea.io/assets/matic/0x2953399124f0cbb46d2cbacd8a89cf0599974963/35103123611336801526804063328030384999994157736697582032169469748067830857768 \n' +
      '    Share it: https://twitter.com/intent/tweet?url=https://opensea.io/assets/matic/0x2953399124f0cbb46d2cbacd8a89cf0599974963/35103123611336801526804063328030384999994157736697582032169469748067830857768&text=Check%20out%20this%20sick%20Year%20on%20Yup%20NFT%20I%20got%20%40yup_io%20!!'
  ],
  [
    'skyempire90',
    'Thanks for an amazing year of curating on Yup \n' +
      '\n' +
      '    As a gift, we made you a custom 1/1 NFT to commemorate your year on Yup \n' +
      '    \n' +
      '    Enjoy it: https://opensea.io/assets/matic/0x2953399124f0cbb46d2cbacd8a89cf0599974963/35103123611336801526804063328030384999994157736697582032169469748067830857768 \n' +
      '    Share it: https://twitter.com/intent/tweet?url=https://opensea.io/assets/matic/0x2953399124f0cbb46d2cbacd8a89cf0599974963/35103123611336801526804063328030384999994157736697582032169469748067830857768&text=Check%20out%20this%20sick%20Year%20on%20Yup%20NFT%20I%20got%20%40yup_io%20!!'
  ],
  [
    'Harkenschmitt',
    'Thanks for an amazing year of curating on Yup \n' +
      '\n' +
      '    As a gift, we made you a custom 1/1 NFT to commemorate your year on Yup \n' +
      '    \n' +
      '    Enjoy it: https://opensea.io/assets/matic/0x2953399124f0cbb46d2cbacd8a89cf0599974963/35103123611336801526804063328030384999994157736697582032169469748067830857768 \n' +
      '    Share it: https://twitter.com/intent/tweet?url=https://opensea.io/assets/matic/0x2953399124f0cbb46d2cbacd8a89cf0599974963/35103123611336801526804063328030384999994157736697582032169469748067830857768&text=Check%20out%20this%20sick%20Year%20on%20Yup%20NFT%20I%20got%20%40yup_io%20!!'
  ],
  [
    'SufiPathan5',
    'Thanks for an amazing year of curating on Yup \n' +
      '\n' +
      '    As a gift, we made you a custom 1/1 NFT to commemorate your year on Yup \n' +
      '    \n' +
      '    Enjoy it: https://opensea.io/assets/matic/0x2953399124f0cbb46d2cbacd8a89cf0599974963/35103123611336801526804063328030384999994157736697582032169469748067830857768 \n' +
      '    Share it: https://twitter.com/intent/tweet?url=https://opensea.io/assets/matic/0x2953399124f0cbb46d2cbacd8a89cf0599974963/35103123611336801526804063328030384999994157736697582032169469748067830857768&text=Check%20out%20this%20sick%20Year%20on%20Yup%20NFT%20I%20got%20%40yup_io%20!!'
  ]
]

sendTwitterMsg(dbObj);