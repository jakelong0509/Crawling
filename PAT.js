const fs = require("fs");
const puppeteer = require('puppeteer');
const async = require('async');
const path = require('path');
const { pseudoRandomBytes } = require("crypto");
const xlsx = require("xlsx");

const filePath = "./collected/PAT_2.xlsx";
var results = [];

const workBook = xlsx.utils.book_new();
let mainWorksheet = xlsx.utils.json_to_sheet(results);
xlsx.utils.book_append_sheet(workBook, mainWorksheet, 'All Data');
mainWorksheet["!cols"] = [{width:25}];

const url = 'https://patsupermarket.com/';
const menuData = [];

(async () => {
    const browser = await puppeteer.launch(
        {
            headless:false
        }
    );
    const page = await browser.newPage();
    await page.setViewport({width: 1366, height: 768});
    try
    {
        await page.goto("https://patsupermarket.com");
        await page.waitForSelector('#category-lnb');
        var menu = await page.$$("#category-lnb > div[class='position'] > ul[class='d1-wrap'] > li[class='d1 li xans-record- be']");
        let d1 = null;
        for(d1 of menu)
        {
            let d2_menu = await d1.$$("div[class='d2-wrap'] > dl > dd[class='d2 be']");
            let d2 = null;
            for(d2 of d2_menu)
            {
                let d3_menu = await d2.$$("dl[class='d3-wrap'] > dd[class='d3']");
                let d3 = null;
                for(d3 of d3_menu)
                {
                    let obj = new Object();
                    obj.Category_1 = await (await d1.$("a[class='-mov']")).evaluate(el => el.textContent); 
                    obj.Category_2 = await (await d2.$("a")).evaluate(el => el.textContent);
                    let a = await d3.$("a");
                    obj.Category_3 = await a.evaluate(el => el.textContent);
                    obj.href = url + await a.evaluate(el => el.getAttribute("href"));
                    menuData.push(obj);
                    //await page.waitForSelector("[class='prdList grid5']");
                }
            }
        }
        var mObject = new Object();
        mObject.Category_1 = "General";
        mObject.Category_2 = "General";
        mObject.Category_3 = "General";
        mObject.href = "https://patsupermarket.com/category/mississauga/205";
        menuData.push(mObject);

        
        // var mObject = new Object();
        // mObject.Category_1 = "DRY";
        // mObject.Category_2 = "Soy Sauce & Oil";
        // mObject.Category_3 = "Vinegar";
        // mObject.href = "https://patsupermarket.com/category/vinegar/264/";
        // menuData.push(mObject);



        let m = null;
        
        for(m of menuData)
        {
            var productsObj = [];
            await page.goto(m.href);
            await page.waitForSelector("p[class='prdCount']");
            // if(m.href == 'https://patsupermarket.com/category/vinegar/264')
            // {
            //     console.log("Vinegar");
            // }
            let paging = await page.$$("div[class='xans-element- xans-product xans-product-normalpaging ec-base-paginate'] > ol > li[class='xans-record-']");
            let currentUrl = page.url();
            for(let i = 1; i<=paging.length; i++)
            {
                let productCount = parseInt(await (await page.$("p[class='prdCount'] > strong")).evaluate(el => el.textContent));
                if(productCount > 0 )
                {
                    // go through each product
                    let products = await page.$$("li[class='item xans-record-']")
                    for(let p of products)
                    {
                        let clonedObject = Object.assign({}, m);
                        clonedObject.productHref = url + await (await p.$("div[class='thumbnail'] > a")).evaluate(el => el.getAttribute("href"));
                        productsObj.push(clonedObject);
                    }
                }
                await page.goto(currentUrl + "?page=" + (i+1));
                await page.waitForSelector("p[class='prdCount']");
            }
            
            for(let p of productsObj)
            {
                await page.goto(p.productHref);
                await page.waitForSelector("h2[class='item_name']");
                let name = await (await page.$("h2[class='item_name']")).evaluate(el => el.textContent);
                p.name = name;
                if(await page.$("#span_product_price_custom") !== null)
                {
                    p.price = await (await page.$("#span_product_price_custom > strike")).evaluate(el => el.textContent);
                }
                else
                {
                    p.price = await (await page.$("#span_product_price_text")).evaluate(el => el.textContent);
                }
                
                p.imgUrl = (await (await page.$("img[class='BigImage ']")).evaluate(el => el.getAttribute("src"))).replace("//", "https://");
            }

            results = results.concat(productsObj);
            console.log(results);
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

