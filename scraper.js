const fs = require("fs");
const puppeteer = require('puppeteer');
const async = require('async');
const path = require('path');
const { pseudoRandomBytes } = require("crypto");
const xlsx = require("xlsx");

var filePath = `./collected/Meat.xlsx`;
let allData = [];

const workBook = xlsx.utils.book_new();
let mainWorksheet = xlsx.utils.json_to_sheet(allData);
xlsx.utils.book_append_sheet(workBook, mainWorksheet, 'All Data');
mainWorksheet["!cols"] = [{width:25}];

(async () => {
    const browser = await puppeteer.launch(
        {
            headless:false
        }
    );
    const page = await browser.newPage();
    await page.setViewport({ width: 1366, height: 768});
    try
    {
        var originalWebpage = 'https://www.tntsupermarket.com/fresh-frozen/meat';
        await page.goto(originalWebpage + ".html");
        await page.waitForSelector('[class="items ln-items-cat category"]');
        var catList = [];
        const categories = await page.$$("[class='items ln-items-cat category'] > li");
        for(var i = 0; i<categories.length; i++)
        {
            let catObj = Object();
            catObj.String = await categories[i].evaluate(el => el.textContent);
            if(catObj.String == "Top Picks")
            {
                continue;
            }
            if(catObj.String == "Chicken")
            {
                catObj.String = "Chichken";
            }
            var catUrl = (catObj.String).toLowerCase().replace(" &", "").split(" ").join("-");
            catObj.Web = originalWebpage + "/" + catUrl + ".html";
            catList.push(catObj);
        }
        for(let x in catList)
        {
            await Promise.all([page.goto(catList[x].Web), page.waitForNavigation({waitUntil: 'networkidle2', timeout:0})]);
            await page.waitForSelector("[class='products list items product-items']");
            for(var y = 0; y<10; y++)
            {
                //await new Promise(resolve=> setTimeout(resolve, 1000));
                var buttonText = null;
                try
                {
                    buttonText = await page.evaluate(() => document.querySelector(".has_more").innerText);
                }
                catch(e)
                {
                    buttonText = await page.evaluate(() => document.querySelector(".no_more").innerText);
                }
                
                // no style means page is loading => no click
                pageLoadingStyle = await page.evaluate(() => document.querySelector(".page_loading").getAttribute("style"));
                if(pageLoadingStyle != "")
                {
                    if(buttonText === "View More")
                    {
                        await page.click("[class='has_more']");
                        await page.waitForTimeout(3000);
                    }
                    else
                    {
                        break;
                    }
                }
            }
            var products = await page.$$("[class='item product product-item']");
            for(let y in products)
            {
                let productData = Object();
                let img = await products[y].$("[class='product-image-photo']");
                productData.imgUrl = await img.evaluate(el => el.getAttribute("src"));
                let div = await products[y].$("[class='product-item-details']");
                productData.name = await (await div.$("a")).evaluate(el => el.textContent);
                productData.price = await (await div.$("[class='price']")).evaluate(el => el.textContent);
                productData.Category = "Meat";
                productData.SubCategory = catList[x].String;
                allData.push(productData);
            }
        }
        xlsx.utils.sheet_add_json(mainWorksheet, allData);
        xlsx.writeFile(workBook, filePath);
        await browser.close();
    }
    catch(e)
    {
        console.log(e);
    }
})();



