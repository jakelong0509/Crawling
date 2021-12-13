const fs = require("fs");
const puppeteer = require('puppeteer');
const async = require('async');
const path = require('path');
const { pseudoRandomBytes } = require("crypto");
const xlsx = require("xlsx");
const { emitKeypressEvents } = require("readline");

const url = "https://mi.alpremium.ca";
var results = [];
const filePath = "./collected/AlPremium.xlsx";
const workBook = xlsx.utils.book_new();
let mainWorksheet = xlsx.utils.json_to_sheet(results);
xlsx.utils.book_append_sheet(workBook, mainWorksheet, 'All Data');
mainWorksheet["!cols"] = [{width:25}];



const cat2 = [   
// ,"APPLE"
// ,"PEARS"
// ,"ORANGES & CITRUS"
// ,"GRAPES"
// ,"BERRIES & CHEERIS"
// ,"PEACHES, PLUM & NECTARINES"
// ,"MELONS"
// ,"AVOCADO & TROPICAL"
// ,"ROOT VEGETABLES"
// ,"LEAFY VEGETABLES"
// ,"PEPPERS"
// ,"TOMATOES"
// ,"SQUASH"
// ,"CUCUMBERS"
// ,"EGGPLANTS"
// ,"BEANS & PEAS"
// ,"BEEF"
// ,"PORK"
// ,"CHICKEN & POULTRY"
// ,"GOAT, MUTTON OR LAMB"
// ,"SAUSAGES & PRESERVED MEAT"
// ,"MEAT BALL & FISH BALLS"
// ,"BACON, HOT DOGS & SAUSAGES"
// ,"LIVE SEAFOOD"
// ,"FRESH SEAFOOD"
// ,"MILK & CREAM"
// ,"EGGS"
// ,"YOGURT"
// ,"BUTTER & MARGARINE" 
// ,"CHEESE & SPREAD"
// ,"TOFU & BEANCURD"
// ,"FRESH NOODLES"
// ,"WRAPPERS"
// ,"SOFT DRINKS"
// ,"JUICE"
// ,"WATER"
// ,"INSTANT DRINKS"
// ,"ENERGY DRINKS"
// ,"SOY, RICE & NUT DRINKS"
// ,"FROZEN MEAT"
// ,"FROZEN SEAFOOD"
// ,"FROZEN FRUIT & VEGETABLES"
// ,"FROZEN MEALS"
// ,"ICE CREAM"
// ,"FROZEN DIM SUM"
// ,"RICE, FLOUR & COOKING OIL"
// ,"VERMICELLI & NOODLE"
// ,"SAUCES, SPICES & SEASONINGS"
];

const cat3 = [
// "AVOCADO"
// ,"MANGO"
// ,"TROPICAL"
// ,"ONIONS"
// ,"POTATOES"
// ,"SWEET POTATO & YAMS"
// ,"CARROT & TURNIPS"
// ,"ORGANIC CHICKEN"
// ,"CHILLED JUICE"
// ,"COFFEE"
// ,"TEA & MILK TEA"
// ,"RICE"
// ,"FLOUR & BAKING AIDS"
// ,"COOKING OIL"
// ,"DRIED NOODLE"
// ,"VERMICELLI"
// ,"INSTANT NOODLE"
// ,"SAUCES"
// ,"SPICES"
// ,"SEASONINGS"
// ,"COOKING ESSENTIALS"
];



async function autoScroll(page){
    await page.evaluate(async () => {
        await new Promise((resolve, reject) => {
            var distance = 20;
            var timer = setInterval(() => {
                var stopper = document.getElementsByClassName('infinite-scrolling')[0].getElementsByTagName('a')[0].innerText;
                window.scrollBy(0, distance);
                if(stopper.toLowerCase() == "no more product"){
                    clearInterval(timer);
                    resolve();
                }
            }, 50);
        });
    });
}

(async () => {
    const browser = await puppeteer.launch(
        {
            headless:false
        }
    );
    const page = await browser.newPage();
    await page.setViewport({width: 1366, height: 768});
    await page.setDefaultNavigationTimeout(0);

    try
    {
        await page.goto(url);
        await page.waitForSelector("[class='site-nav-dropdown']");
        var categories = await page.$$("[class='menu-lv-1 item dropdown no-mega-menu main-category-main-item cat-tree'] > [class='sub-menu-mobile menu-mb-translate'] > ul[class='site-nav-dropdown'] > li");
        
        let c = null;
        var data = []
        // for(c of categories)
        // {
        //     let category_1 = (await (await c.$("a")).evaluate(el => el.textContent)).trim();
            
        //     if(await c.$("div") == null)
        //     {
        //         let d = new Object();
        //         d.Category_1 = category_1;
        //         d.Category_2 = "";
        //         d.Category_3 = "";
        //         d.Url = url + (await (await c.$("a")).evaluate(el => el.getAttribute("href")));
        //         data.push(d);
        //     }
        //     else{
        //         let categories_level2 = await c.$$("div > ul > li");
        //         let c2 = null;
        //         for(c2 of categories_level2)
        //         {
        //             let category_2 = (await (await c2.$("a")).evaluate(el => el.textContent)).trim();
        //             if(await c2.$("ul") == null)
        //             {
        //                 let d = new Object();
        //                 d.Category_1 = category_1;
        //                 d.Category_2 = category_2;
        //                 d.Category_3 = "";
        //                 d.Url = url + (await (await c2.$("a")).evaluate(el => el.getAttribute("href")));
        //                 data.push(d);
        //             }
        //             else
        //             {
        //                 let categories_level3 = await c2.$$("ul > li");
        //                 let c3 = null;
        //                 for(c3 of categories_level3)
        //                 {
        //                     let d = new Object();
        //                     d.Category_1 = category_1;
        //                     d.Category_2 = category_2;
        //                     d.Category_3 = (await (await c3.$("a")).evaluate(el => el.textContent)).trim();
        //                     d.Url = url + (await (await c3.$("a")).evaluate(el => el.getAttribute("href")));
        //                     data.push(d);
        //                 }
        //             }
                    
        //         }
        //     }
        // }

        var test = new Object();
        test.Category_1 = "MEAT";
        test.Category_2 = "CHICKEN & POULTRY";
        test.Category_3 = "";
        test.Url = "https://mi.alpremium.ca/collections/chicken-poultry";
        data.push(test);

        
        let d = null;
        for(d of data)
        {
            if(cat2.includes(d.Category_2.toUpperCase()) || cat3.includes(d.Category_3.toUpperCase()))
            {
                continue;
            }
            await page.goto(d.Url);
            await page.waitForSelector("div[data-section-id='collection-template-default']");

            if(await page.$("div[class='infinite-scrolling']") !== null)
            {
                // do scrolling down until textContect turn into "No more product"
                await autoScroll(page);
            }
            
            var products = await page.$$("div[class='product-collection products-grid row'] > div");
            let p = null;
            let productData = []
            for(p of products)
            {
                var sizeList = await p.$$("div[class='product-des abs-bottom'] > ul[class='sizes-list'] > li");
                if(sizeList.length > 0)
                {
                    let li = null;
                    for (li of sizeList)
                    {
                        let dataDetails = Object.assign({}, d);
                        dataDetails.productUrl = url + await (await li.$("a")).evaluate(el => el.getAttribute("href"));
                        productData.push(dataDetails);
                    }
                    
                }
                else
                {
                    let dataDetails = Object.assign({}, d);
                    dataDetails.productUrl = url + await (await p.$("div[class='product-image'] > a[class='product-grid-image']")).evaluate(el => el.getAttribute("href"));
                    productData.push(dataDetails);
                }
            }

            let  = null;
            for(pd of  productData)
            {
                await page.goto(pd.productUrl);
                await page.waitForSelector("div[class='col-md-6 product-shop']");
                let div = await page.$("div[class='col-md-6 product-shop']");
                pd.name = await (await (await div.$$("h1[class='product-title'] > span"))[0].evaluate(el => el.textContent)).replace("\n", "").trim();
                
                let divPrice = await div.$("div[class='prices']");
                if(await divPrice.$("span[class='compare-price']") !== null && await divPrice.$("span[style='display: none;']") == null)
                {
                    let price = await (await (await divPrice.$("span[class='compare-price']")).evaluate(el => el.textContent)).replace("$", "").trim();
                    if(await divPrice.$("span[class='price on-sale'] > span[class='size']") !== null)
                    {
                        pd.unit = await (await (await divPrice.$("span[class='price on-sale'] > span[class='size']")).evaluate(el => el.textContent)).trim();
                    }
                    else
                    {
                        pd.unit = "";
                    }
                    pd.price = price.replace(pd.unit, "");
                }
                else
                {
                    let price = await (await (await divPrice.$("span[class='price']")).evaluate(el => el.textContent)).replace("$", "").trim();
                    if(await divPrice.$("span[class='price'] > span[class='size']") !== null)
                    {
                        pd.unit = await (await (await divPrice.$("span[class='price'] > span[class='size']")).evaluate(el => el.textContent)).trim();
                    }
                    else
                    {
                        pd.unit = "";
                    }
                    pd.price = price.replace(pd.unit, "");
                }

                let ppu = await (await (await div.$("span[class='ppu']")).evaluate(el => el.textContent)).trim().replace("(", "").replace(")", "");
                if(ppu !== "")
                {
                    pd.price_per_r_unit = ppu.split("/")[0].replace("$","");
                    pd.r_unit = ppu.split("/")[1];
                }
                else
                {
                    pd.price_per_r_unit = "";
                    pd.r_unit = "";
                }

                let button = await (await (await div.$("#product-add-to-cart")).evaluate(el => el.textContent)).trim();
                if(button.toLowerCase() == "add to cart")
                {
                    pd.status = "In Stock";
                }
                else
                {
                    pd.status = "Out of Stock";
                }

                if(await page.$("a[class='fancybox']") !== null)
                {
                    pd.imgUrl = await (await page.$("a[class='fancybox']")).evaluate(el => el.getAttribute("href"));
                }
                else
                {
                    pd.imgUrl = "";
                }
                results.push(pd);
                await page.waitForTimeout(1000);
            }
            await page.waitForTimeout(1000);
            xlsx.utils.sheet_add_json(mainWorksheet, results);
            xlsx.writeFile(workBook, filePath);
        }
        await browser.close();
    }
    catch(e)
    {
        console.log(e);
    }
})();



