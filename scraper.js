const fs = require("fs");
const puppeteer = require('puppeteer');
const async = require('async');
const path = require('path');
const { pseudoRandomBytes } = require("crypto");
const xlsx = require("xlsx");

const filePath = `./collected/Home&Living.xlsx`;
const lastUrl = '/tt-groceries/kitchen-home';
const category = "Home & Living";
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
        var originalWebpage = 'https://www.tntsupermarket.com' + lastUrl;
        await page.goto(originalWebpage + ".html");
        await page.waitForSelector('[class="items ln-items-cat category"]');
        var catList = [];
        const categories = await page.$$("[class='items ln-items-cat category'] > li");
        for(var i = 0; i<categories.length; i++)
        {
            let catObj = Object();
            catObj.String = await categories[i].evaluate(el => el.textContent);
            if(catObj.String == "Top Picks" || catObj.String == "Live!" || catObj.String == "Free Gift With Durians!" || catObj.String == "Hotpot Ingredients" || catObj.String == "Weight Management")
            {
                continue;
            }
            let catStringArray = null;
            if(catObj.String == "Octopus & Squid")
            {
                catStringArray = ("Mollus Seafood").toLowerCase().split(" ");
            }
            else if(catObj.String == "Processed Seafood")
            {
                catStringArray = ("Surimi Seafood").toLowerCase().split(" ");
            }
            else if(catObj.String == "Chicken")
            {
                catStringArray = ("Chichken").toLowerCase().split(" ");
            }
            else if(catObj.String == "Tofu Products")
            {
                catStringArray = ("Bean Products").toLowerCase().split(" ");
            }
            else if(catObj.String == "Processed food")
            {
                catStringArray = ("Sausages Meatballs").toLowerCase().split(" ");
            }
            else if(catObj.String == "Frozen fruits & Vegetables")
            {
                catStringArray = ("Frozen Produce Bean Products").toLowerCase().split(" ");
            }
            else if(catObj.String == "Delicious Tarts")
            {
                catStringArray = ("Egg Tarts").toLowerCase().split(" ");
            }
            else if(catObj.String == "Chinese Pastries")
            {
                catStringArray = ("Chinese panstries").toLowerCase().split(" ");
            }
            else if(catObj.String == "Jerky & Seaweeds")
            {
                catStringArray = ("Jerkies & Seaweeds").toLowerCase().split(" ");
            }
            else if(catObj.String == "Jelly & Preserved Fruits")
            {
                catStringArray = ("Jellies & Preserved Fruits").toLowerCase().split(" ");
            }
            else if(catObj.String == "Candy & Chocolate")
            {
                catStringArray = ("Candies & Chocolates").toLowerCase().split(" ");
            }
            else if(catObj.String == "Beauty")
            {
                catStringArray = ("Masks").toLowerCase().split(" ");
            }
            else
            {
                catStringArray = (catObj.String).toLowerCase().split(" ");
            }
            let s = "";
            for(var o in catStringArray)
            {
                var v = catStringArray[o].replace("!", "").replace("&", "");
                if(v !== "")
                {
                    s = s + v + " ";
                }
            }
            let catUrl = s.substring(0, s.length - 1);
            catObj.Web = originalWebpage + "/" + catUrl.replace(/ /g, "-") + ".html";
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
                if (await div.$("[class='was-price']") !== null)
                {
                    productData.price = await (await div.$("[class='was-price'] > span")).evaluate(el => el.textContent);
                }
                else
                {
                    productData.price = await (await div.$("[class='price']")).evaluate(el => el.textContent);
                }
                let status = null;
                if(await div.$("[class='actions-primary'] > div[class='stock unavailable']") !== null)
                {
                    status = "Out of Stock";
                }
                else
                {
                    status = "In Stock";
                }
                productData.Category = category;
                productData.SubCategory = catList[x].String;
                productData.Status = status;
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



