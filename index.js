const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const puppeteer = require("puppeteer");

const app = express();
const port = 3000;

var cors = require("cors");

app.use(cors());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.get("/market/:keyword", async (req, res) => {
  const { keyword } = req.params;

  const browser = await puppeteer.launch({
    //headless:false로 변경하면 브라우저 창이 뜨는것을 볼 수 있습니다.
    headless: false,
    // 크롬이 설치된 위치를 입력해줍니다. 엣지 등 크로미움 기반의 웹브라우저도 지원됩니다.
    // executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    args: ["--window-size=1920,1080"],
    slowMo: 30,
  });
  const page = await browser.newPage();

  await page.setViewport({
    width: 1920,
    height: 1080,
  });

  await Promise.all([page.goto("https://www.coupang.com/np/search?component=&q=" + encodeURI(keyword) + "&channel=user"), page.waitForNavigation()]);

  let target = "//div[@class='search-query-result']//dl[@class='search-related-keyword']//dd";

  await page.waitForXPath(target);
  let s = await page.$x(target);

  const keywordDatas = [];
  //   s = s[0];
  let iIdx = 0;
  for (item of s) {
    const value = await item.evaluate((el) => el.textContent);
    console.log("value", value);
    console.log(iIdx++);
    keywordDatas.push(value);
  }

  await browser.close();

  // const naverKeyword = await crawlData(keyword);
  // const naverRelKeyword = await crawlNaverRelData(keyword);

  // const coupangKeyword = await crawlCoupangData(keyword);

  // const keyquery = req.query;
  // console.log(keyquery);

  res.send({ data: { keywordDatas } });
});

async function crawlCoupangData(keyword) {
  try {
    const url = `https://www.coupang.com/np/search?component=&q=키보드&channel=user`;

    const { data } = await axios.get(url);
    const $ = cheerio.load(data);
    const keywordDatas = [];

    $(".productList ul", data).each((index, element) => {
      const rowTag = $(element);
      const rowdata = $(element).children("li").text();

      console.log(rowdata);
    });

    return keywordDatas;
  } catch (error) {
    console.error(error);
  }
}

async function crawlData(keyword) {
  try {
    const url = `https://keywordmaster.net/키워드검색량조회/?keyword=` + keyword;

    const { data } = await axios.get(url);
    const $ = cheerio.load(data);
    const keywordDatas = [];

    $(".keywords #data tbody tr", data).each((index, element) => {
      const rowTag = $(element);
      const rowdata = $(element).children("td").text();

      const title = $(rowTag).find("td:eq(0)").text();
      const monthlySearchCountPC = $(rowTag).find("td:eq(1)").text(); // 월간검색수 PC
      const monthlySearchCountMobile = $(rowTag).find("td:eq(2)").text(); // 월간검색수 모바일
      const competition = $(rowTag).find("td:eq(7)").text(); // 경쟁정도

      if (index < 10) {
        keywordDatas.push({
          title,
          monthlySearchCountPC,
          monthlySearchCountMobile,
          competition,
        });
      }
    });

    return keywordDatas;
  } catch (error) {
    console.error(error);
  }
}

async function crawlNaverRelData(keyword) {
  try {
    const url = `https://search.shopping.naver.com/search/all?query=` + keyword + `&cat_id=&frm=NVSHATC`;

    const { data } = await axios.get(url);
    const $ = cheerio.load(data);
    const keywordDatas = [];

    $(".relatedTags_relation_srh__YG9s7 ul li", data).each((index, element) => {
      const rowTag = $(element);
      const rowdata = $(element).text();

      // const title = $(rowTag).find("td:eq(0)").text();
      // const monthlySearchCountPC = $(rowTag).find("td:eq(1)").text(); // 월간검색수 PC
      // const monthlySearchCountMobile = $(rowTag).find("td:eq(2)").text(); // 월간검색수 모바일
      // const competition = $(rowTag).find("td:eq(7)").text(); // 경쟁정도

      keywordDatas.push({
        index,
        rowdata,
      });
    });

    return keywordDatas;
  } catch (error) {
    console.error(error);
  }
}

app.get("/sound/:name", (req, res) => {
  const p = req.params;
  console.log(p);
  const q = req.query;
  console.log(q);

  res.send({ data: p });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
