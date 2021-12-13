const fs = require("fs");
const puppeteer = require('puppeteer');
const async = require('async');
const path = require('path');
const { pseudoRandomBytes } = require("crypto");
const xlsx = require("xlsx");

// const crawlMap = [
//   {
//     category: "COVID Cleaning and Disinfection",
//     subCategory: null,
//     href: "https://www.agorav.com/en/collections/covid"
//   }
// ];
const crawlMap = [
  {
    category: "Fruit",
    subCategory: null,
    href: "https://www.agorav.com/en/collections/%E6%B0%B4%E6%9E%9C-fruit"
  },
  {
    category: "Vegetable",
    subCategory: "Leafy Vegetable",
    href: "https://www.agorav.com/en/collections/leafy-%E5%8F%B6%E8%8F%9C"
  },
  {
    category: "Vegetable",
    subCategory: "Mushroom",
    href: "https://www.agorav.com/en/collections/mushroom-%E8%98%91%E8%8F%87"
  },
  {
    category: "Vegetable",
    subCategory: "Root Beans",
    href: "https://www.agorav.com/en/collections/root-stem-%E6%A0%B9%E8%8C%8E"
  },
  {
    category: "Vegetable",
    subCategory: "Other Vegetables",
    href: "https://www.agorav.com/en/collections/other-vegetables-%E5%85%B6%E4%BB%96%E8%94%AC%E8%8F%9C"
  },
  {
    category: "Fresh Meat",
    subCategory: "Poultry",
    href: "https://www.agorav.com/en/collections/%E7%94%9F%E9%B2%9C%E5%AE%B6%E7%A6%BD"
  },
  {
    category: "Fresh Meat",
    subCategory: "Beef",
    href: "https://www.agorav.com/en/collections/fresh-beef-%E6%96%B0%E9%B2%9C%E7%89%9B%E8%82%89"
  },
  {
    category: "Fresh Meat",
    subCategory: "Lamb",
    href: "https://www.agorav.com/en/collections/fresh-lamb-%E6%96%B0%E9%B2%9C%E7%BE%8A%E8%82%89"
  },
  {
    category: "Fresh Meat",
    subCategory: "Pork",
    href: "https://www.agorav.com/en/collections/fresh-pork-%E6%96%B0%E9%B2%9C%E7%8C%AA%E8%82%89"
  },
  {
    category: "Fresh Meat",
    subCategory: "Other Meat",
    href: "https://www.agorav.com/en/collections/other-meat-%E5%85%B6%E4%BB%96%E8%82%89%E7%B1%BB"
  },
  {
    category: "Grocery",
    subCategory: "Grain, Oil & Seasoning",
    href: "https://www.agorav.com/en/collections/grain-oil-seasoning-%E7%B2%AE%E6%B2%B9%E7%B1%B3%E9%9D%A2%E9%85%B1%E6%96%99"
  },
  {
    category: "Grocery",
    subCategory: "Canned Food",
    href: "https://www.agorav.com/en/collections/canned-food-%E7%BD%90%E5%A4%B4%E9%A3%9F%E5%93%81"
  },
  {
    category: "Grocery",
    subCategory: "Instant food & Noodles",
    href: "https://www.agorav.com/en/collections/instant-food-noodles-%E9%80%9F%E9%A3%9F%E9%A3%9F%E5%93%81"
  },
  {
    category: "Grocery",
    subCategory: "Dry goods",
    href: "https://www.agorav.com/en/collections/%E5%B9%B2%E8%B4%A7"
  },
  {
    category: "Grocery",
    subCategory: "Other Groceries",
    href: "https://www.agorav.com/en/collections/other-groceries-%E5%85%B6%E4%BB%96%E6%9D%82%E8%B4%A7"
  },
  {
    category: "Grocery",
    subCategory: "Household Supply",
    href: "https://www.agorav.com/en/collections/household-supply"
  },
  {
    category: "Snacks",
    subCategory: "Japanese & Korean Snack",
    href: "https://www.agorav.com/en/collections/%E6%97%A5%E9%9F%A9%E9%9B%B6%E9%A3%9F"
  },
  {
    category: "Snacks",
    subCategory: "Candy",
    href: "https://www.agorav.com/en/collections/candy"
  },
  {
    category: "Snacks",
    subCategory: "Beverages",
    href: "https://www.agorav.com/en/collections/beverages-%E9%A5%AE%E5%93%81"
  },
  {
    category: "Frozen Food",
    subCategory: "Frozen Noodles, Dumplings & Dim sum",
    href: "https://www.agorav.com/en/collections/frozen-noodles-dumplings-dim-sum-%E5%86%B7%E5%86%BB%E9%9D%A2%E9%A3%9F"
  },
  {
    category: "Frozen Food",
    subCategory: "Seafood",
    href: "https://www.agorav.com/en/collections/frozen-seafood-%E5%86%B0%E9%B2%9C%E6%B5%B7%E4%BA%A7"
  },
  {
    category: "Frozen Food",
    subCategory: "Frozen Meat Products",
    href: "https://www.agorav.com/en/collections/frozen-meat-products"
  },
  {
    category: "Frozen Food",
    subCategory: "Frozen Vegetables and Fruits",
    href: "https://www.agorav.com/en/collections/frozen-vegetables-and-fruits-%E5%86%B7%E5%86%BB%E8%94%AC%E8%8F%9C-%E6%B0%B4%E6%9E%9C"
  },
  {
    category: "Frozen Food",
    subCategory: "deli",
    href: "https://www.agorav.com/en/collections/deli-%E8%85%8C%E8%82%89%E5%88%B6%E5%93%81"
  },
  {
    category: "Frozen Food",
    subCategory: "Ice Cream",
    href: "https://www.agorav.com/en/collections/ice-cream-%E5%86%B0%E6%B7%87%E6%B7%8B"
  },
  {
    category: "Frozen Food",
    subCategory: "Eggs",
    href: "https://www.agorav.com/en/collections/eggs-%E9%B8%A1%E8%9B%8B"
  },
  {
    category: "Frozen Food",
    subCategory: "Milk & Cream",
    href: "https://www.agorav.com/en/collections/milk-cream-%E7%89%9B%E5%A5%B6-%E5%A5%B6%E6%B2%B9"
  },
  {
    category: "Frozen Food",
    subCategory: "Soy Product",
    href: "https://www.agorav.com/en/collections/soy-product-%E8%B1%86%E5%88%B6%E5%93%81"
  },
  {
    category: "Frozen Food",
    subCategory: "Steamed Buns",
    href: "https://www.agorav.com/en/collections/steamed-buns-%E9%A6%92%E5%A4%B4%E5%8C%85%E5%AD%90"
  },
  {
    category: "Frozen Food",
    subCategory: "Tofu",
    href: "https://www.agorav.com/en/collections/tofu-%E8%B1%86%E8%85%90"
  },
  {
    category: "Frozen Food",
    subCategory: "Cold drinks & Yogurt",
    href: "https://www.agorav.com/en/collections/yogurt-%E9%85%B8%E5%A5%B6"
  },
  {
    category: "Frozen Food",
    subCategory: "Frozen Korean Food",
    href: "https://www.agorav.com/en/collections/frozen-korean-food"
  },
  {
    category: "Frozen Food",
    subCategory: "Other Refrigerated Goods",
    href: "https://www.agorav.com/en/collections/other-refrigerated-goods-%E5%85%B6%E4%BB%96%E5%86%B7%E8%97%8F%E4%BA%A7%E5%93%81"
  },
  {
    category: "Bread-Dessert",
    subCategory: "Traditional Bread",
    href: "https://www.agorav.com/en/collections/%E4%BC%A0%E7%BB%9F%E9%9D%A2%E5%8C%85"
  },
  {
    category: "Bread-Dessert",
    subCategory: "Japanese Cake",
    href: "https://www.agorav.com/en/collections/%E6%97%A5%E6%9C%AC%E8%9B%8B%E7%B3%95"
  },
  {
    category: "Luxury Food",
    subCategory: null,
    href: "https://www.agorav.com/en/collections/%E9%AB%98%E7%BA%A7%E9%A3%9F%E6%9D%90-%E5%91%B3%E9%81%93%E6%9B%B4%E4%BD%B3-luxury-food"
  },
  {
    category: "Hot Pot",
    subCategory: null,
    href: "https://www.agorav.com/en/collections/hot-pot-%E7%81%AB%E9%8D%8B"
  },
  {
    category: "Korean Food",
    subCategory: null,
    href: "https://www.agorav.com/en/collections/korean-food"
  },
  {
    category: "COVID Cleaning and Disinfection",
    subCategory: null,
    href: "https://www.agorav.com/en/collections/covid"
  }
];

const capitalizePhrase = function(phrase) {
  const arr = phrase.toLowerCase().split(" ");
  for (var i = 0; i < arr.length; i++) {
    arr[i] = arr[i].charAt(0).toUpperCase() + arr[i].slice(1);
  }
  return arr.join(" ");
};

const filePath = `./collected/test/b-trust.xlsx`;

let allData = {};
crawlMap.forEach(obj => allData[obj.category] = []);

const workBook = xlsx.utils.book_new();

let sheets = {};
Object.keys(allData).forEach(category => {
  sheets[category] = xlsx.utils.json_to_sheet(allData[category]);
  xlsx.utils.book_append_sheet(workBook, sheets[category], category);
  sheets[category]["!cols"] = [{width:25}];
});

(async () => {
  const browser = await puppeteer.launch(
      {
        headless:true
      }
  );

  const page = await browser.newPage();
  await page.setViewport({ width: 1366, height: 768});
  try
  {
    for(u of crawlMap) {
      var originalWebpage = u.href;

      await page.goto(originalWebpage);
      await page.waitForSelector('a.title');

      const pagination = await page.$('.pagination');
      if (pagination && u.href.indexOf('?page') === -1) {
        const otherPages = await page.$$('.pagination li > a:not(.next)');
        for (const o of otherPages) {
          const newLinkToCrawl = await o.evaluate(el => el.href);
          crawlMap.push({
            category: u.category,
            subCategory: u.subCategory,
            href: newLinkToCrawl
          });
        }
      }

      const productTitlesInCollectionPage = await page.$$('a.title');
      let productLinks = [];

      for (const p of productTitlesInCollectionPage) {
        productLinks.push(await p.evaluate(el => el.href));
      }

      for (const i of productLinks) {
        await page.goto(i);
        await page.waitForSelector('.product-container');

        const fullImgUrl = await (await page.$('.rimage-outer-wrapper img')).evaluate(el => el.currentSrc);
        const productObj = {
          name: capitalizePhrase(await (await page.$('.product-title')).evaluate(el => el.textContent)),
          price: await page.$('.was-price') ?
              await (await page.$('.was-price')).evaluate(el => el.textContent) :
              await (await page.$('.current-price')).evaluate(el => el.textContent),
          Category: u.category,
          SubCategory: u.subCategory,
          Url: i,
          imgUrl: fullImgUrl.slice(0, fullImgUrl.indexOf('?'))
        };
        allData[u.category].push(productObj);
      }
      xlsx.utils.sheet_add_json(sheets[u.category], allData[u.category]);
    }

    //test
    // const testUrl_1 = 'https://www.agorav.com/en/products/%E9%9F%A9%E5%9B%BD%E5%B9%B4%E7%B3%95%E7%89%87-500g-korean-rice-cake-sliced';
    // const testUrl_2 = 'https://www.agorav.com/en/collections/mushroom-%E8%98%91%E8%8F%87/products/%E6%9C%89%E6%9C%BA-%E9%87%91%E9%92%88%E8%8F%87-%E4%B8%80%E8%A2%8B';
    // const testUrls = [
    //   'https://www.agorav.com/en/products/%E9%9F%A9%E5%9B%BD%E5%B9%B4%E7%B3%95%E7%89%87-500g-korean-rice-cake-sliced',
    //   'https://www.agorav.com/en/collections/mushroom-%E8%98%91%E8%8F%87/products/%E6%9C%89%E6%9C%BA-%E9%87%91%E9%92%88%E8%8F%87-%E4%B8%80%E8%A2%8B'
    // ]
    // for (i of testUrls) {
    //   await page.goto(i);
    //   await page.waitForSelector('.product-container');
    //
    //   const productObj = {
    //     name: capitalizePhrase(await (await page.$('.product-title')).evaluate(el => el.textContent)),
    //     price: await page.$('.was-price') ?
    //       await (await page.$('.was-price')).evaluate(el => el.textContent) :
    //       await (await page.$('.current-price')).evaluate(el => el.textContent)
    //   };
    //   console.log(productObj);
    // }

    console.log(allData);
    xlsx.writeFile(workBook, filePath);
    await browser.close();


  }
  catch(e)
  {
    console.log(e);
  }
})();
