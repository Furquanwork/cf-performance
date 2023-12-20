// @ts-check
import { join } from "path";
import { readFileSync } from "fs";
import express from "express";
import serveStatic from "serve-static";
import shopify from "./shopify.js";
import productCreator from "./product-creator.js";
import PrivacyWebhookHandlers from "./privacy.js";
import fs from 'fs';
import path from 'path';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

const port = parseInt(
  process.env.BACKEND_port || process.env.port || "3000",
  10
);

const STATIC_PATH =
  process.env.NODE_ENV === "production"
    ? `${process.cwd()}/frontend/dist`
    : `${process.cwd()}/frontend/`;

const app = express();

// Set up Shopify authentication and webhook handling
app.get(shopify.config.auth.path, shopify.auth.begin());
app.get(
  shopify.config.auth.callbackPath,
  shopify.auth.callback(),
  shopify.redirectToShopifyOrAppRoot()
);
app.post(
  shopify.config.webhooks.path,
  shopify.processWebhooks({ webhookHandlers: PrivacyWebhookHandlers })
);

// If you are adding routes outside of the /api path, remember to
// also add a proxy rule for them in web/frontend/vite.config.js

app.use("/api/*", shopify.validateAuthenticatedSession());

app.use(express.json());

app.get("/api/products/count", async (_req, res) => {
  const countData = await shopify.api.rest.Product.count({
    session: res.locals.shopify.session,
  });
  console.log('count data', countData)
  res.status(200).send(countData);
});

app.get("/api/products/create", async (_req, res) => {
  let status = 200;
  let error = null;

  try {
    await productCreator(res.locals.shopify.session);
  } catch (e) {
    console.log(`Failed to process products/create: ${e.message}`);
    status = 500;
    error = e.message;
  }
  res.status(status).send({ success: status === 200, error });
});

app.use(shopify.cspHeaders());
app.use(serveStatic(STATIC_PATH, { index: false }));


app.use("/*", shopify.ensureInstalledOnShop(), async (_req, res, _next) => {
  console.log('shopname', _req.query.shop)

  return res
    .status(200)
    .set("Content-Type", "text/html")
    .send(readFileSync(join(STATIC_PATH, "index.html")));
});

app.use(bodyParser.json());


app.get('/api/themes',   async (_req, res) => {
  // Assuming session is obtained through the OAuth process
  console.log('api hit successful;l;y')
  try {
    const themes =await shopify.api.rest.Product.count({
      session: res.locals.shopify.session,
    });
    console.log('themes check', themes)
     
    const responseData = themes 

    console.log('Response:', responseData);  

    res.status(200).json(responseData);
  } catch (error) {
    console.error('here is error of retrive theme',error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.put('/admin/api/2023-04/themes/:id', async (_req, res) => {
  const shopDomain  =  _req.query.shop;
  const themeId=_req.params.id;
  console.log('here is theme detail', _req)
  try {
     
    const filePath = path.join(__dirname, 'themes', `${themeId}.js`);
    let themeFileContent = fs.readFileSync(filePath, 'utf-8');
 
    const thirdPartyScriptRegex = new RegExp(`<script.*?src=["'](https?:\/\/(?!${shopDomain}).*?)["'].*?><\/script>`, 'g');
 
    themeFileContent = themeFileContent.replace(thirdPartyScriptRegex, `/* ${thirdPartyScriptRegex} */`)
 
    fs.writeFileSync(filePath, themeFileContent, 'utf-8');

    const iframeScript = `<iframe loading="lazy" src="https://(?!${shopDomain}).*?/path/to/your/script" frameborder="0" allowfullscreen></iframe>`;
    themeFileContent = themeFileContent.replace(thirdPartyScriptRegex, iframeScript) ;
        

    fs.writeFileSync(filePath, themeFileContent, 'utf-8');

    res.json({ success: true });
  } catch (error) {
    console.error('Error modifying theme:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

export default app;





