import puppeteer from "puppeteer-extra";
import os from "os";

// this is just an array of your assets as objects
import db from "./data/yup_nft.js";

import pluginStealth from "puppeteer-extra-plugin-stealth";

puppeteer.use(pluginStealth());

const openSeaPage = "https://opensea.io/asset/create";
const openSeaPageLogin = "https://opensea.io/login";
// Change this to the path where the images are stored
const NFTImageFolder = "K:\\dev\\projects\\node-scripts\\yup-discord-bot\\wip\\imgs";

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
  } else if ( osType === "Darwin") { // NEED to chenge paths to match the borwser you are using
    executablePath = '/Volumes/Google Chrome Canary/Google Chrome Canary.app';
    userDataDir = '/Users/noahsolnick/Library/Application Support/Google/Chrome Canary/Default';
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
  
  // Await for login  
  await page.goto(openSeaPageLogin);
  await page.goto(openSeaPageLogin); // need to do this twice so the auth window opens (simulate some user activity)
  const findMetamaskButton = await page.waitForSelector("main ul li button:nth-child(1)", {visible: true});
  await findMetamaskButton.click();
  await page.waitForNavigation();

  console.log('assume logged in');
  await page.goto(openSeaPage);

  const dbContinue = db.slice(1);

  for (const el of dbContinue) {
    const uploadInput = await page.waitForSelector("#media");
    const uploadInputParent = await uploadInput.getProperty("parentNode");

    const [fileChooser] = await Promise.all([page.waitForFileChooser(), await uploadInputParent.click()]);
    await fileChooser.accept([`${NFTImageFolder}\\${el.id}.png`]);

    await typeInInputElement(page, "#name", el.title);
    await typeInInputElement(page, "#external_link", el.externalLink);
    await (await page.waitForSelector("#description")).type(el.description);

    const assetCollectionSelect = await page.waitForSelector('input[placeholder="Select collection"]');
    await assetCollectionSelect.type(el.collectionName, { delay: 0 });
    
    // Time for react to process the dropdown input
    await page.waitForTimeout(1000);

    const collectionParentOfParrent = await (await (await assetCollectionSelect.getProperty("parentNode")).getProperty("parentNode")).asElement();
    const colSelectEl = await waitForSelectorElement(collectionParentOfParrent, "div + div + div");
    await colSelectEl.click();

    break;

    const assetAddPropTrStBtns = await page.$$("div.AssetFormTraitSection--side button");
    await assetAddPropTrStBtns[0].click();
    let propertyCounter = 1;
    for (const property in el.properties) {
      const trEl = await page.waitForSelector(`tbody.AssetTraitsForm--body tr:nth-child(${propertyCounter})`);
      const propNameValueInput = await trEl.$$("input");
      await propNameValueInput[0].type(property);
      await propNameValueInput[1].type(el.properties[property]);
      if (Object.keys(el.properties)[Object.keys(el.properties).length - 1] !== property) {
        propertyCounter++;
        const addMoreBtn = await page.waitForSelector("section table + button");
        await addMoreBtn.click();
      }
    }
    const assetsavePropBtn = await page.waitForSelector("footer button");
    await assetsavePropBtn.click();

    const assetChainInput = await page.waitForSelector("#chain");
    await assetChainInput.click();

    const chainParentOfParrent = await (await (await assetChainInput.getProperty("parentNode")).getProperty("parentNode")).asElement();
    const chainSelectEl = await waitForSelectorElement(chainParentOfParrent, "div + div + div");
    await chainSelectEl.click();

    (await page.waitForSelector(".AssetForm--submit button")).click();
    await page.waitForNavigation();
    await page.goto(openSeaPage);
  }
  console.log("done");
})();
