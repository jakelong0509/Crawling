const fs = require("fs");
// const { chromium } = require("playwright");
const puppeteer = require('puppeteer');
const async = require('async');
const path = require('path');
const xlsx = require("xlsx");

const location = 'wellesley'; // 'bloor';
const filePath = `./collected/galleria.${location}-${Date.now()}.xlsx`;
console.log('Will save csv to ', filePath);

const testCrawlMap = [
  {
    "category": "GROCERY",
    "subCat1": "SNACK",
    "subCat2": "COOKIES &  SNACKS",
    "subCatCode": "AE01AA"
  },
];

(async () => {
  /*const browser = await chromium.launch(
      {
        headless: true,
        chromiumSandbox: false,
        args: ['--window-size=1366,768'],
      }
  );*/

  let totalCrawledProducts = 0


  const browser = await puppeteer.launch(
      {
        headless: true
      }
  );

  const page = await browser.newPage();
  await page.setViewport({ width: 1366, height: 768});

  console.log('Selecting store location ', location);
  await selectStore(page);

  const crawlCatMap = await getCrawlMap(page);
  // const crawlCatMap = testCrawlMap;

  // console.log('crawlCatMap', JSON.stringify(crawlCatMap, null, 2));

  // setup work book
  const allData = {};
  crawlCatMap.forEach(obj => allData[obj.category] = []);
  const workBook = xlsx.utils.book_new();
  let sheets = {};
  Object.keys(allData).forEach(category => {
    sheets[category] = xlsx.utils.json_to_sheet(allData[category]);
    xlsx.utils.book_append_sheet(workBook, sheets[category], category);
    sheets[category]["!cols"] = [{width:25}];
  });

  try {
    for(let crawlObj of crawlCatMap) {
      const originalWebpage = getUrlByCatCode(crawlObj.subCatCode, location)

      await page.goto(originalWebpage);
      await page.waitForSelector('.pro-list');

      // load more ...
      let viewMoreBtn = await page.$('.more-results-btn')
      let countMoreProduct = await (await page.$('#spShowViewCnt')).evaluate(el => el.textContent.trim());

      while(countMoreProduct !== '0') {
        await viewMoreBtn.click();
        await sleep();
        countMoreProduct = await (await page.$('#spShowViewCnt')).evaluate(el => el.textContent.trim());
      }

      // Get all product links for a subcategory
      const productLinks = [];
      const productPhotos = await  page.$$('.pro-list .item .item-img-info:not(.img-out-of-stock) .product-image')
      for (const p of productPhotos) {
        productLinks.push(await p.evaluate(el => el.href));
      }

      console.log('crawling product crawlObj', crawlObj);
      for (const productLink of productLinks) {
        try {
          console.log('crawling product', productLink);
          await page.goto(productLink);
          await page.waitForSelector('.product-view');
          const $productTopMain = await page.$('.product-view');

          const inStockEl = await $productTopMain.$('.price-block .availability.in-stock');
          // do not scan product if not in stock
          if (!inStockEl) {
            continue;
          }
          const nameEl = await $productTopMain.$('.product-name h1');

          const oldPriceEl = await $productTopMain.$('.price-block .old-price .price');
          const currentPriceEl = await $productTopMain.$('.price-block .special-price .price');
          const finalPriceEl = oldPriceEl ? oldPriceEl : currentPriceEl;
          const unitPrice = await finalPriceEl.evaluate(el => el.textContent.trim().replace('$ ', ''));
          const unit = await currentPriceEl.evaluate(el => el.nextSibling.textContent.replace('/', '').trim());

          const descriptionEl = await $productTopMain.$('.ten-plus-one > fieldset > div');
          const description = descriptionEl ? await (descriptionEl.evaluate(el => el.textContent.trim())) : '';

          const imageEl = await $productTopMain.$('.product-image');
          const barcodeEl = await $productTopMain.$('.price-block .other-info span:nth-child(2)');

          const productObj = {
            name: (await nameEl.evaluate(el => el.textContent.trim())),
            unitPrice,
            unit,
            category: crawlObj.category,
            subCat1: crawlObj.subCat1,
            subCat2: crawlObj.subCat2,
            barcode: (await barcodeEl.evaluate(el => el.textContent.trim().replace('Barcode: ', ''))),
            url: productLink,
            imageUrl: (await imageEl.evaluate(el => {
              const backgroundImage = el.style.backgroundImage;
              const regex = /^url\("(.+)"\)$/;
              const tokens = backgroundImage.match(regex);
              return tokens[1] ? `https://www.galleriasm.com${tokens[1]}` : ''
            })),
            description,
          }

          allData[crawlObj.category].push(productObj);
        } catch (e) {
          console.log('Error when crawling product', productLink, e);
        }
      }

      totalCrawledProducts += productLinks.length;
      console.log('Total products crawled: ', totalCrawledProducts);

      // Write to workbook each time done crawling a subcategory
      console.log('Done crawling and now Writing to workbook for', crawlObj.category, crawlObj.subCat1, crawlObj.subCat2);
      xlsx.utils.sheet_add_json(sheets[crawlObj.category], allData[crawlObj.category]);
      xlsx.writeFile(workBook, filePath);

    }

    console.log('Finnish crawling...')
    await browser.close();


  }
  catch(e)
  {
    console.log(e);
    await browser.close();
  }
})();

const getCrawlMap = async (page) => {
  const crawlCatMap = []

  const topCatEls = await page.$$('.mega-menu-category > ul > li');
  for (const catEl of topCatEls) {
    const catName = await (await catEl.$('a#btnTopCate')).evaluate(el => el.textContent.trim().replaceAll('/', ' & '));

    const subCat1BlockEls = await catEl.$$('.col-md-4.col-sm-6');

    for (const subCat1El of subCat1BlockEls) {
      const subCat1Link = await subCat1El.$('h3 > a')
      const subCat1Name = await subCat1Link.evaluate(el => el.textContent.trim().replaceAll('/', ' & '));

      const onclickAttr = await subCat1Link.evaluate(el => el.getAttribute('onclick'));
      const subCat1Code = onclickAttr.match(/^gotoSubCate\("(.+)"\);$/)[1];

      const subCat2BlockEls = await subCat1El.$$('ul > li');

      if (subCat2BlockEls.length === 0) {
        crawlCatMap.push({
          category: catName,
          subCat1: subCat1Name,
          subCat2: '',
          subCatCode: subCat1Code
        })
      }

      for (const subCat2El of subCat2BlockEls) {
        const subCat2Link = await subCat2El.$('a');
        const subCat2Name = await subCat2Link.evaluate(el => el.textContent.trim().replaceAll('/', ' & '));

        const onclickAttr2 = await subCat2Link.evaluate(el => el.getAttribute('onclick'));
        const subCat2Code = onclickAttr2.match(/^gotoSubCate\("(.+)"\);$/)[1];

        crawlCatMap.push({
          category: catName,
          subCat1: subCat1Name,
          subCat2: subCat2Name,
          subCatCode: subCat2Code
        });
      }
    }
  }

  return crawlCatMap;
}

function getUrlByCatCode(catCode, storeLocation) {
  let branchNo = '';
  switch (storeLocation) {
    case 'bloor':
      branchNo = '005';
      break;
    case 'wellesley':
      branchNo = '004'
      break;
    default:
      throw new Error(`storeLocation ${storeLocation} is not supported yet`);
  }

  return 'https://www.galleriasm.com/Category/ProductListWithCate?Searchtext=' + catCode + '&BranchNo=' + branchNo + '&langCode=EN&Sort=&TotalCount=40&CurrrentPage=1&Pagesize=40';
}

async function selectStore(page) {
  const storeChangeUrl = 'https://www.galleriasm.com/Home/ChangStore';
  const bloorSelectBtnSelector = `#${location} + div.store-box .btn-select`;
  const changeStoreBtnSelector = '#divStoreNote button[onclick="gotoChangeStorePage();"]';
  await page.goto(storeChangeUrl);
  await page.waitForSelector(bloorSelectBtnSelector);
  await page.click(bloorSelectBtnSelector);
  await page.waitForSelector(changeStoreBtnSelector, {visible: true});
  await page.click(changeStoreBtnSelector);
  await page.waitForNavigation({timeout: 120000});
}

async function sleep(ms = 1000) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}
