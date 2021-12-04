const fs = require("fs");
const puppeteer = require('puppeteer');
const async = require('async');
const path = require('path');
const { pseudoRandomBytes } = require("crypto");
const xlsx = require("xlsx");

const Urls = [
            {category: "Fruits & Vegetables", href:"https://www.tntsupermarket.com/fresh-frozen/fruits-vegetables"}
            , {category: "Meat", href:"https://www.tntsupermarket.com/fresh-frozen/meat"}
            , {category: "Seafood", href:"https://www.tntsupermarket.com/fresh-frozen/seafood"}
            , {category: "Dairy & Frozen", href:"https://www.tntsupermarket.com/fresh-frozen/dairy-frozen"}
            , {category: "Bakery", href:"https://www.tntsupermarket.com/fresh-frozen/bakery"}
            , {category: "Snacks & Drinks", href:"https://www.tntsupermarket.com/tt-groceries/tt-snacks-drinks"}
            , {category: "Food Essentials", href:"https://www.tntsupermarket.com/tt-groceries/tt-food-essentials"}
            , {category: "Beauty & Wellness", href:"https://www.tntsupermarket.com/tt-groceries/beauty-wellness"}
            , {category: "Home & Living", href:"https://www.tntsupermarket.com/tt-groceries/kitchen-home"}
        ];

const filePath = `./collected/T&T.xlsx`;
let allData = {
    "Fruits & Vegetables":[]
    , "Meat":[]
    , "Dairy & Frozen":[]
    , "Bakery":[]
    , "Snacks & Drinks":[]
    , "Food Essentials":[]
    , "Beauty & Wellness":[]
    , "Home & Living":[]
};

console.log(allData);
const workBook = xlsx.utils.book_new();
let sheets = {
    "Fruits & Vegetables":xlsx.utils.json_to_sheet(allData["Fruits & Vegetables"])
    , "Meat":xlsx.utils.json_to_sheet(allData["Meat"])
    , "Dairy & Frozen":xlsx.utils.json_to_sheet(allData["Dairy & Frozen"])
    , "Bakery":xlsx.utils.json_to_sheet(allData["Bakery"])
    , "Snacks & Drinks":xlsx.utils.json_to_sheet(allData["Snacks & Drinks"])
    , "Food Essentials":xlsx.utils.json_to_sheet(allData["Food Essentials"])
    , "Beauty & Wellness":xlsx.utils.json_to_sheet(allData["Beauty & Wellness"])
    , "Home & Living":xlsx.utils.json_to_sheet(allData["Home & Living"])
};


xlsx.utils.book_append_sheet(workBook, sheets["Fruits & Vegetables"], "Fruits & Vegetables");
xlsx.utils.book_append_sheet(workBook, sheets["Meat"], "Meat");
xlsx.utils.book_append_sheet(workBook, sheets["Dairy & Frozen"], "Dairy & Frozen");
xlsx.utils.book_append_sheet(workBook, sheets["Bakery"], "Bakery");
xlsx.utils.book_append_sheet(workBook, sheets["Snacks & Drinks"], "Snacks & Drinks");
xlsx.utils.book_append_sheet(workBook, sheets["Food Essentials"], "Food Essentials");
xlsx.utils.book_append_sheet(workBook, sheets["Beauty & Wellness"], "Beauty & Wellness");
xlsx.utils.book_append_sheet(workBook, sheets["Home & Living"], "Home & Living");
sheets["Fruits & Vegetables"]["!cols"] = [{width:25}];
sheets["Meat"]["!cols"] = [{width:25}];
sheets["Dairy & Frozen"]["!cols"] = [{width:25}];
sheets["Bakery"]["!cols"] = [{width:25}];
sheets["Snacks & Drinks"]["!cols"] = [{width:25}];
sheets["Food Essentials"]["!cols"] = [{width:25}];
sheets["Beauty & Wellness"]["!cols"] = [{width:25}];
sheets["Home & Living"]["!cols"] = [{width:25}];


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
        let u = null;
        for(u of Urls)
        {
            var originalWebpage = u.href;
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
                if(u.category == "Snacks & Drinks" || u.category == "Food Essentials")
                {
                    catObj.Web = originalWebpage + "/tt-" + catUrl.replace(/ /g, "-") + ".html";
                }
                else
                {
                    catObj.Web = originalWebpage + "/" + catUrl.replace(/ /g, "-") + ".html";
                }
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
                var productObj = [];
                for(let y in products)
                {
                    let productData = Object();
                    // let img = await products[y].$("[class='product-image-photo']");
                    // productData.imgUrl = await img.evaluate(el => el.getAttribute("src"));
                    let div = await products[y].$("[class='product-item-details']");
                    productData.name = await (await (await div.$("a")).evaluate(el => el.textContent)).trim();
                    if (await div.$("[class='was-price']") !== null)
                    {
                        productData.price = await (await div.$("[class='was-price'] > span")).evaluate(el => el.textContent);
                    }
                    else
                    {
                        productData.price = await (await div.$("[class='price']")).evaluate(el => el.textContent);
                    }

                    if(await div.$("[class='sale-weight-uom']") !== null)
                    {
                        productData.Unit = await (await (await div.$("[class='sale-weight-uom']")).evaluate(el => el.textContent)).replace("/", "");
                    }
                    else
                    {
                        productData.Unit = "";
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
                    productData.Category = u.category;
                    productData.SubCategory = catList[x].String;
                    productData.Status = status;
                    productData.Url = await (await products[y].$("[class='product-item-photo']")).evaluate(el => el.getAttribute("href"));
                    productObj.push(productData);
                }

                let p = null
                for(p of productObj)
                {
                    await page.goto(p.Url);
                    await page.waitForSelector("[class='fotorama__img']");
                    p.imgUrl = await (await page.$("[class='fotorama__img']")).evaluate(el => el.getAttribute("src"));
                    if(await page.$("[class='unit-price-average-weight'] > span") !== null)
                    {
                        p.avgWeight = await (await (await page.$$("[class='unit-price-average-weight'] > span"))[1].evaluate(el => el.textContent)).replace("Avg. Weight: ", "").replace(" lb", "");
                    }
                    else
                    {
                        p.avgWeight = "";
                    }
                    let size = await (await page.$("[class='swatch-option selected']")).evaluate(el => el.textContent.toLowerCase());
                    if(size == "ea")
                    {
                        p.size = "each";
                    }
                    else
                    {
                        p.size = size;
                    }
                    
                    allData[u.category].push(p);
                }
            }
            xlsx.utils.sheet_add_json(sheets[u.category], allData[u.category]);
        }
        xlsx.writeFile(workBook, filePath);
        await browser.close();
    }
    catch(e)
    {
        console.log(e);
    }
})();



