const fs = require("fs");
const puppeteer = require('puppeteer');
const async = require('async');
const path = require('path');
const { pseudoRandomBytes } = require("crypto");
const xlsx = require("xlsx");

const filePath = `./collected/t-t-new.xlsx`;

const crawlMap = [
    // Fruits & Vegetables
  {
    category: 'Fruits & Vegetables',
    subCategory: 'Fresh Fruits',
    href: 'https://www.tntsupermarket.com/fresh-frozen/fruits-vegetables/fresh-fruits.html'
  },
  {
    category: 'Fruits & Vegetables',
    subCategory: 'Tropical Fruits',
    href: 'https://www.tntsupermarket.com/fresh-frozen/fruits-vegetables/tropical-fruits.html'
  },
  {
    category: 'Fruits & Vegetables',
    subCategory: 'Leaf Vegetables',
    href: 'https://www.tntsupermarket.com/fresh-frozen/fruits-vegetables/leaf-vegetables.html'
  },
  {
    category: 'Fruits & Vegetables',
    subCategory: 'Root Vegetables',
    href: 'https://www.tntsupermarket.com/fresh-frozen/fruits-vegetables/root-vegetables.html'
  },
  {
    category: 'Fruits & Vegetables',
    subCategory: 'Flower Vegetables',
    href: 'https://www.tntsupermarket.com/fresh-frozen/fruits-vegetables/flower-vegetables.html'
  },
  {
    category: 'Fruits & Vegetables',
    subCategory: 'Mushrooms',
    href: 'https://www.tntsupermarket.com/fresh-frozen/fruits-vegetables/mushrooms.html'
  },
  {
    category: 'Fruits & Vegetables',
    subCategory: 'Bamboo Shoots & Processed Vegetables',
    href: 'https://www.tntsupermarket.com/fresh-frozen/fruits-vegetables/bamboo-shoots-processed-vegetables.html'
  },
    // meat
  {
    category: 'Meat',
    subCategory: 'Pork',
    href: 'https://www.tntsupermarket.com/fresh-frozen/meat/pork.html'
  },
  {
    category: 'Meat',
    subCategory: 'Beef',
    href: 'https://www.tntsupermarket.com/fresh-frozen/meat/beef.html'
  },
  {
    category: 'Meat',
    subCategory: 'Lamb',
    href: 'https://www.tntsupermarket.com/fresh-frozen/meat/lamb.html'
  },
  {
    category: 'Meat',
    subCategory: 'Chicken',
    href: 'https://www.tntsupermarket.com/fresh-frozen/meat/chichken.html'
  },
  {
    category: 'Meat',
    subCategory: 'Poultry',
    href: 'https://www.tntsupermarket.com/fresh-frozen/meat/poultry.html'
  },

  // Seafood
  {
    category: 'Seafood',
    subCategory: 'Fish',
    href: 'https://www.tntsupermarket.com/fresh-frozen/seafood/fish.html'
  },
  {
    category: 'Seafood',
    subCategory: 'Shrimp & Lobster & Crab',
    href: 'https://www.tntsupermarket.com/fresh-frozen/seafood/shrimp-lobster-crab.html'
  },
  {
    category: 'Seafood',
    subCategory: 'Shell Seafood',
    href: 'https://www.tntsupermarket.com/fresh-frozen/seafood/shell-seafood.html'
  },
  {
    category: 'Seafood',
    subCategory: 'Octopus & Squid',
    href: 'https://www.tntsupermarket.com/fresh-frozen/seafood/mollus-seafood.html'
  },
  {
    category: 'Seafood',
    subCategory: 'Processed Seafood',
    href: 'https://www.tntsupermarket.com/fresh-frozen/seafood/surimi-seafood.html'
  },

  // Dairy & Frozen
  {
    category: 'Dairy & Frozen',
    subCategory: 'Dairy & Eggs',
    href: 'https://www.tntsupermarket.com/fresh-frozen/dairy-frozen/dairy-eggs.html'
  },
  {
    category: 'Dairy & Frozen',
    subCategory: 'Tofu Products',
    href: 'https://www.tntsupermarket.com/fresh-frozen/dairy-frozen/bean-products.html'
  },
  {
    category: 'Dairy & Frozen',
    subCategory: 'Juices & Drinks',
    href: 'https://www.tntsupermarket.com/fresh-frozen/dairy-frozen/juices-drinks.html'
  },
  {
    category: 'Dairy & Frozen',
    subCategory: 'Processed food',
    href: 'https://www.tntsupermarket.com/fresh-frozen/dairy-frozen/sausages-meatballs.html'
  },
  {
    category: 'Dairy & Frozen',
    subCategory: 'Plant & Flour Products',
    href: 'https://www.tntsupermarket.com/fresh-frozen/dairy-frozen/plant-flour-products.html'
  },
  {
    category: 'Dairy & Frozen',
    subCategory: 'Frozen Flour Products',
    href: 'https://www.tntsupermarket.com/fresh-frozen/dairy-frozen/frozen-flour-products.html'
  },
  {
    category: 'Dairy & Frozen',
    subCategory: 'Frozen Desserts & Ice Creams',
    href: 'https://www.tntsupermarket.com/fresh-frozen/dairy-frozen/frozen-desserts-ice-creams.html'
  },
  {
    category: 'Dairy & Frozen',
    subCategory: 'Frozen Prepared Food',
    href: 'https://www.tntsupermarket.com/fresh-frozen/dairy-frozen/frozen-prepared-food.html'
  },
  {
    category: 'Dairy & Frozen',
    subCategory: 'Frozen fruits & Vegetables',
    href: 'https://www.tntsupermarket.com/fresh-frozen/dairy-frozen/frozen-produce-bean-products.html'
  },

  // Bakery
  {
    category: 'Bakery',
    subCategory: 'Festive Treats',
    href: 'https://www.tntsupermarket.com/fresh-frozen/bakery/festive-treats.html'
  },
  {
    category: 'Bakery',
    subCategory: 'Breads',
    href: 'https://www.tntsupermarket.com/fresh-frozen/bakery/breads.html'
  },
  {
    category: 'Bakery',
    subCategory: 'Birthday Cakes',
    href: 'https://www.tntsupermarket.com/fresh-frozen/bakery/birthday-cakes.html'
  },
  {
    category: 'Bakery',
    subCategory: 'Cakes',
    href: 'https://www.tntsupermarket.com/fresh-frozen/bakery/cakes.html'
  },
  {
    category: 'Bakery',
    subCategory: 'Chinese Pastries',
    href: 'https://www.tntsupermarket.com/fresh-frozen/bakery/chinese-panstries.html'
  },
  {
    category: 'Bakery',
    subCategory: 'Desserts',
    href: 'https://www.tntsupermarket.com/fresh-frozen/bakery/desserts.html'
  },
  {
    category: 'Bakery',
    subCategory: 'Cookies',
    href: 'https://www.tntsupermarket.com/fresh-frozen/bakery/cookies.html'
  },

  // Snacks & Drinks
  {
    category: 'Snacks & Drinks',
    subCategory: 'Biscuits & Chips',
    href: 'https://www.tntsupermarket.com/tt-groceries/tt-snacks-drinks/tt-biscuits-chips.html'
  },
  {
    category: 'Snacks & Drinks',
    subCategory: 'Cakes & Pastries',
    href: 'https://www.tntsupermarket.com/tt-groceries/tt-snacks-drinks/tt-cakes-pastries.html'
  },
  {
    category: 'Snacks & Drinks',
    subCategory: 'Jerky & Seaweeds',
    href: 'https://www.tntsupermarket.com/tt-groceries/tt-snacks-drinks/tt-jerkies-seaweeds.html'
  },
  {
    category: 'Snacks & Drinks',
    subCategory: 'Nuts',
    href: 'https://www.tntsupermarket.com/tt-groceries/tt-snacks-drinks/tt-nuts.html'
  },
  {
    category: 'Snacks & Drinks',
    subCategory: 'Jelly & Preserved Fruits',
    href: 'https://www.tntsupermarket.com/tt-groceries/tt-snacks-drinks/tt-jellies-preserved-fruits.html'
  },
  {
    category: 'Snacks & Drinks',
    subCategory: 'Candy & Chocolate',
    href: 'https://www.tntsupermarket.com/tt-groceries/tt-snacks-drinks/tt-candies-chocolates.html'
  },
  {
    category: 'Snacks & Drinks',
    subCategory: 'Beverages',
    href: 'https://www.tntsupermarket.com/tt-groceries/tt-snacks-drinks/tt-beverages.html'
  },
  {
    category: 'Snacks & Drinks',
    subCategory: 'Dairy & Drink Mixes',
    href: 'https://www.tntsupermarket.com/tt-groceries/tt-snacks-drinks/tt-dairy-drink-mixes.html'
  },

    //Food Essentials
  {
    category: 'Food Essentials',
    subCategory: 'Cooking Oils & Rice',
    href: 'https://www.tntsupermarket.com/tt-groceries/tt-food-essentials/tt-cooking-oils-rice.html'
  },
  {
    category: 'Food Essentials',
    subCategory: 'Instant Foods & Noodles',
    href: 'https://www.tntsupermarket.com/tt-groceries/tt-food-essentials/tt-instant-foods-noodles.html'
  },
  {
    category: 'Food Essentials',
    subCategory: 'Sauces & Pickled Vegetables',
    href: 'https://www.tntsupermarket.com/tt-groceries/tt-food-essentials/tt-sauces-pickled-vegetables.html'
  },
  {
    category: 'Food Essentials',
    subCategory: 'Chinese Herbs & Dried Foods',
    href: 'https://www.tntsupermarket.com/tt-groceries/tt-food-essentials/tt-chinese-herbs-dried-foods.html'
  },

    //Beauty & Wellness
  {
    category: 'Beauty & Wellness',
    subCategory: 'Beauty',
    href: 'https://www.tntsupermarket.com/tt-groceries/beauty-wellness/masks.html'
  },
  {
    category: 'Beauty & Wellness',
    subCategory: 'Hair Care',
    href: 'https://www.tntsupermarket.com/tt-groceries/beauty-wellness/hair-care.html'
  },
  {
    category: 'Beauty & Wellness',
    subCategory: 'Personal Care',
    href: 'https://www.tntsupermarket.com/tt-groceries/beauty-wellness/personal-care.html'
  },
  {
    category: 'Beauty & Wellness',
    subCategory: 'Wellness',
    href: 'https://www.tntsupermarket.com/tt-groceries/beauty-wellness/wellness.html'
  },

    // Home & Living
  {
    category: 'Home & Living',
    subCategory: 'Kitchenware',
    href: 'https://www.tntsupermarket.com/tt-groceries/kitchen-home/kitchenware.html'
  },
  {
    category: 'Home & Living',
    subCategory: 'Dining',
    href: 'https://www.tntsupermarket.com/tt-groceries/kitchen-home/dining.html'
  },
  {
    category: 'Home & Living',
    subCategory: 'Household & Cleaning Products',
    href: 'https://www.tntsupermarket.com/tt-groceries/kitchen-home/household-cleaning-products.html'
  },
  {
    category: 'Home & Living',
    subCategory: 'Appliances',
    href: 'https://www.tntsupermarket.com/tt-groceries/kitchen-home/appliances.html'
  },
  {
    category: 'Home & Living',
    subCategory: 'Baby & Child Care',
    href: 'https://www.tntsupermarket.com/tt-groceries/kitchen-home/baby-child-care.html'
  },
  {
    category: 'Home & Living',
    subCategory: 'Lifestyle',
    href: 'https://www.tntsupermarket.com/tt-groceries/kitchen-home/lifestyle.html'
  },
]

const testCrawlMap = [
  {
    category: 'Meat',
    subCategory: 'Pork',
    href: 'https://www.tntsupermarket.com/fresh-frozen/fruits-vegetables/bamboo-shoots-processed-vegetables.html'
  }
]

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
        headless: false
      }
  );

  const page = await browser.newPage();
  await page.setViewport({ width: 1366, height: 768});

  try {
    for(let crawlObj of crawlMap) {
      const originalWebpage = crawlObj.href;

      await page.goto(originalWebpage);
      await page.waitForSelector('.items.product-items');

      // Todo: add delivery postcode

      // load more ...
      let viewMoreBtn = await page.$('.has_more')
      while(viewMoreBtn) {
        await page.waitForSelector('.page_loading', {hidden: true})
        await page.click('.has_more');
        await page.waitForSelector('.page_loading', {hidden: true})
        viewMoreBtn = await page.$('.has_more')
      }

      // Get all product links
      const productLinks = [];
      const productPhotos = await  page.$$('.product-item .product-item-photo')
      for (const p of productPhotos) {
        productLinks.push(await p.evaluate(el => el.href));
      }

      for (const productLink of productLinks) {
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
            size: (await (await $productTopMain.$('.swatch-option.selected')).evaluate(el => el.textContent.toLowerCase())),
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

