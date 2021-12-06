const fs = require("fs");
const express = require('express');
const fetch = require('node-fetch');
const htmlParser = require("node-html-parser");

const app = express();
const port = 3000;

app.use(express.json()) // for parsing application/json
app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded

const genScript = (url) => {
  let el = new htmlParser.HTMLElement("script", {});
  el.innerHTML = `window.__ZortURL = "${url.replace(/"/g, "\\\"")}";`;
};

const importScript = () => {
  let el = new htmlParser.HTMLElement("script", {});
  el.setAttribute("type", "text/javascript");
  el.setAttribute("src", "https://mebzort.glitch.me/c.js");
};

let Proxy = async (req, res) => {
  console.log(`New request: ${req.originalUrl}`);
  //if(req.query.passwd != process.env.PASSWD) return res.send("Invalid Password");
  let url = req.query.url || "https://youtube.com/";
  let f = await fetch(url, {
    method: req.method,
  });
  if(f.headers.get('content-type').includes("html")){
    const body = await f.text();
    if(false && !htmlParser.valid(body)) {
      console.warn(`[ERROR] Invalid HTML at ${url}`);
      f.body.pipe(res);
      return;
    };
    const root = htmlParser.parse(body);
    let html = root.childNodes.filter((x) => x.tagName && x.tagName.toLowerCase() == "html")[0];
    console.log("HTML", html); // is head??? what
    
    if(!html) {
      console.warn(`[ERROR] No <html> at ${url}`);
      res.send(body);
      return;
    };
    
    //let head = html.childNodes.filter((x) => x.tagName && x.tagName.toLowerCase() == "head")[0];
    //console.log("HEAD", head);
    
    html.childNodes.unshift(importScript());
    html.childNodes.unshift(genScript(url));
    
    res.send(html.toString());
    //fs.writeFileSync("./test.json", JSON.stringify(html, (_,v) => typeof(v) == "function" ? v.toString() : v, "\t"));
  } else {
    f.body.pipe(res);
  };
};


const listener = (req, res) => {
  if(!req.query.url) {
    let o = {
      "/": () => res.sendFile(__dirname + "/public/index.html"),
      "/client.js": () => res.sendFile(__dirname + "/public/client.js"),
      "/c.js": () => res.sendFile(__dirname + "/public/c.js"),
    };
    if(o[req.originalUrl]) o[req.originalUrl]();
  } else {
    Proxy(req, res);
  };
};

app.all('/*', listener);

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
