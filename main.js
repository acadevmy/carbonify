const fs = require("fs").promises;
const path = require("path");
const puppeteer = require("puppeteer");

const directoryPath = path.join(__dirname, "input");

const getSnippets = async () => {
  const snippets = [];
  const files = await fs.readdir(directoryPath, (err) => {
    console.log("Error", error);
  });
  for (const file of files) {
    const snippet = await fs.readFile(path.join(directoryPath, file), "utf8");
    snippets.push({ name: file, code: snippet });
  }
  return snippets;
};

const config = {
  bg: "rgba(255, 255, 255, 1)", //background color
  ds: true, //dropShadow
  dsblur: "68px", //dropShadowBlurRadius
  dsyoff: "20px", //dropShadowOffsetY
  es: "2x", //exportSize
  fm: "Hack", //fontFamily
  fl: 1, //firstLineNumber
  fs: "14px", //fontSize
  l: "auto", //language
  ln: true, //lineNumbers
  ph: "10px", //paddingHorizontal
  pv: "10px", //paddingVertical
  si: false, //squaredImage
  t: "seti", //theme
  wa: true, //widthAdjustment
  // width: 800,
  wc: true, //windowControls
};

const convertToParams = (myData) => {
  var out = [];
  for (var key in myData) {
    if (myData.hasOwnProperty(key)) {
      out.push(key + "=" + encodeURIComponent(myData[key]));
    }
  }
  return out.join("&");
};

(async () => {
  const snippets = await getSnippets();
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  let index = 1;
  for (const snippet of snippets) {
    console.log(`Carbonifying snippet ${index} of ${snippets.length}`);
    await page.goto(
      `https://carbon.now.sh?${convertToParams(config)}&code=${encodeURI(
        snippet.code
      )}`
    );

    const codeContainer = await page.$("#export-container");
    await page.addStyleTag({ content: ".CodeMirror-sizer{min-height: 0!important}" });
    await codeContainer.screenshot({
      path: `./output/${snippet.name.split(".")[0]}.png`,
    });
    index++;
  }

  await browser.close();
})();
