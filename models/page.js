const puppeteer = require('puppeteer');

let page;

const getPage = async () => {
  if (page) return page;

  const browser = await puppeteer.launch({
    headless:false,
    args: ['--no-sandbox','--disable-setuid-sandbox'],
    // executablePath: stats.executablePath
  });

  page = await browser.newPage();

  return page;
};