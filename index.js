const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");

const app = express();
const port = 3000;

var cors = require("cors");

app.use(cors());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.get("/market/:keyword", async (req, res) => {
  const { keyword } = req.params;

  const naverKeyword = await crawlData(keyword);
  const naverRelKeyword = await crawlNaverRelData(keyword);

  // const keyquery = req.query;
  // console.log(keyquery);

  res.send({ data: { naverKeyword, naverRelKeyword } });
});

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
