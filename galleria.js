const fs = require("fs");
// const puppeteer = require('puppeteer');
const { chromium, devices } = require("playwright");
const async = require('async');
const path = require('path');
const { pseudoRandomBytes } = require("crypto");
const xlsx = require("xlsx");

const filePath = `./collected/galleria-bloor.xlsx`;

/*const crawlMap = [
  {
    category: 'Fruits & Vegetables',
    subCategory: 'Fresh Fruits',
    href: 'https://www.tntsupermarket.com/fresh-frozen/fruits-vegetables/fresh-fruits.html'
  },
];*/

const testCrawlMap = [
  {
    "category": "DELI & READY MEALS",
    "subCat1": "DELI FOOD",
    "subCat2": "SUSHI",
    "subCatCode": "AF04AB"
  },
  {
    "category": "DELI & READY MEALS",
    "subCat1": "DELI FOOD",
    "subCat2": "CATERING",
    "subCatCode": "AF04AA"
  },
  {
    "category": "DELI & READY MEALS",
    "subCat1": "DELI FOOD",
    "subCat2": "MARINATED MEAT",
    "subCatCode": "AF04AC"
  },
  {
    "category": "DELI & READY MEALS",
    "subCat1": "KIMCHI",
    "subCat2": "POGGI KIMCHI",
    "subCatCode": "AF02AB"
  },
  {
    "category": "DELI & READY MEALS",
    "subCat1": "KIMCHI",
    "subCat2": "MAT KIMCHI",
    "subCatCode": "AF02AA"
  },
  {
    "category": "DELI & READY MEALS",
    "subCat1": "KIMCHI",
    "subCat2": "OTHER KIMCHI",
    "subCatCode": "AF02AC"
  },
  {
    "category": "LIFESTYLE GOODS",
    "subCat1": "KITCHENWARE &  APPLIANCE",
    "subCat2": "",
    "subCatCode": "AG01"
  },
  {
    "category": "LIFESTYLE GOODS",
    "subCat1": "COSMETICS &  BEAUTY",
    "subCat2": "",
    "subCatCode": "AG04"
  },
  {
    "category": "LIFESTYLE GOODS",
    "subCat1": "HEALTH PRODUCTS",
    "subCat2": "",
    "subCatCode": "AG03"
  },
  {
    "category": "LIFESTYLE GOODS",
    "subCat1": "SEASONAL PRODUCTS",
    "subCat2": "",
    "subCatCode": "AG05"
  },
  {
    "category": "LIFESTYLE GOODS",
    "subCat1": "HOUSEHOLD GOODS",
    "subCat2": "",
    "subCatCode": "AG02"
  },
  {
    "category": "PET FOODS & SUPPLIES",
    "subCat1": "DOGS",
    "subCat2": "Food / Treats",
    "subCatCode": "AH01AA"
  },
];

/*const allData = {};
crawlMap.forEach(obj => allData[obj.category] = []);

const workBook = xlsx.utils.book_new();

let sheets = {};
Object.keys(allData).forEach(category => {
  sheets[category] = xlsx.utils.json_to_sheet(allData[category]);
  xlsx.utils.book_append_sheet(workBook, sheets[category], category);
  sheets[category]["!cols"] = [{width:25}];
});*/

(async () => {
  const browser = await chromium.launch(
      {
        headless: false,
        chromiumSandbox: false,
        args: ['--window-size=1366,768'],
      }
  );

/*  const context = await browser.createIncognitoBrowserContext();
  const page = await context.newPage();*/

  const page = await browser.newPage();
  // await page.setViewport({ width: 1366, height: 768});

  await selectStore(page);

  const crawlCatMap = await getCrawlMap(page);
  // const crawlCatMap = testCrawlMap;

  console.log('crawlCatMap', JSON.stringify(crawlCatMap, null, 2));

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



  // await browser.close();





  try {
    for(let crawlObj of crawlCatMap) {
      const originalWebpage = getUrlByCatCode(crawlObj.subCatCode)

      // Because changing between product pages only change the query param
      // use page.goto subsequently does not work
      // this is the trick
      // https://stackoverflow.com/questions/62343404/puppeteer-page-goto-not-working-for-query-parameters
      await page.goto('about:blank')

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

      // Get all product links
      const productLinks = [];
      const productPhotos = await  page.$$('.pro-list .item .item-img-info:not(.img-out-of-stock) .product-image')
      for (const p of productPhotos) {
        productLinks.push(await p.evaluate(el => el.href));
      }

      console.log('productLinks',productLinks);

     /* for (const productLink of productLinks) {
        try {
          console.log('crawling product', productLink);
          await page.goto(productLink);
          await page.waitForSelector('.product-top-main .fotorama__img');
          const $productTopMain = await page.$('.product-top-main');

          // Sold by each || Sold by weight
          const soldBy = await ((await $productTopMain.$('.sold-by-method')).evaluate(el => el.textContent.trim().toLowerCase()))
          let priceEl = await $productTopMain.$('.special-price:not([class*="wasprice"])');
          priceEl = priceEl ? priceEl : await $productTopMain.$('.after-price .price');
          const unitPrice = (await priceEl.evaluate(el => el.textContent.trim().replace('$', '')));
          const unit = await $productTopMain.$('.sale-weight-uom') ? (await (await $productTopMain.$('.sale-weight-uom')).evaluate(el => el.textContent.replace('/', ''))) : '';
          const minAllowed = (await (await $productTopMain.$('.box-tocart input.input-text.qty')).evaluate(el => el.getValue()));

          const productObj = {
            name: (await (await $productTopMain.$('.page-title')).evaluate(el => el.textContent.trim())),
            priceSold: soldBy === 'sold by each' ?
                unitPrice
                : (parseFloat(unitPrice) * parseFloat(minAllowed)).toFixed(2),
            unitPrice,
            unit,
            minAllowed,
            soldBy,
            category: crawlObj.category,
            subcategory: crawlObj.subCategory,
            url: productLink,
            imageUrl: (await (await $productTopMain.$('.fotorama__img')).evaluate(el => el.getAttribute('src'))),
            size: (await (await $productTopMain.$('.swatch-option.selected')).evaluate(el => el ? el.textContent.toLowerCase() : '')),
          }

          allData[crawlObj.category].push(productObj);
        } catch (e) {
          console.log('Error when crawling product', productLink, e);
        }
      }

      console.log('Done crawling', crawlObj.category, crawlObj.subCategory)
      xlsx.utils.sheet_add_json(sheets[crawlObj.category], allData[crawlObj.category]);

      // Write to workbook each time done crawling a subcategory
      console.log('Writing to workbook for', crawlObj.category, crawlObj.subCategory );
      xlsx.writeFile(workBook, filePath);*/

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
    const catName = await (await catEl.$('a#btnTopCate')).evaluate(el => el.textContent.trim().replace('/', ' & '));

    const subCat1BlockEls = await catEl.$$('.col-md-4.col-sm-6');

    for (const subCat1El of subCat1BlockEls) {
      const subCat1Link = await subCat1El.$('h3 > a')
      const subCat1Name = await subCat1Link.evaluate(el => el.textContent.trim().replace('/', ' & '));

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
        const subCat2Name = await subCat2Link.evaluate(el => el.textContent.trim());

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

function getUrlByCatCode(catCode) {
  return 'https://www.galleriasm.com/Category/ProductListWithCate?Searchtext=' + catCode + '&BranchNo=005&langCode=EN&Sort=&TotalCount=40&CurrrentPage=1&Pagesize=40';
}

async function selectStore(page) {
  const storeChangeUrl = 'https://www.galleriasm.com/Home/ChangStore';
  const bloorSelectBtnSelector = '#bloor + div.store-box .btn-select';
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
