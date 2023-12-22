// @ts-check
import { join } from "path";
import { readFileSync } from "fs";
import express from "express";
import serveStatic from "serve-static";
import shopify from "./shopify.js";
import PrivacyWebhookHandlers from "./privacy.js";
import fs from 'fs';
import path from 'path';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';

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


app.use("/api/*", shopify.validateAuthenticatedSession());

app.use(express.json());
app.get('/api/themes',   async (_req, res) => {
  console.log('api hit successful;l;y')
  try {
    const themes =await shopify.api.rest.Theme.all({
      session: res.locals.shopify.session,
      // id: 137987326206,
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

app.get("/api/products/count", async (_req, res) => {
  const countData = await shopify.api.rest.Product.count({
    session: res.locals.shopify.session,
  });
  console.log('count data', countData)
  res.status(200).send(countData);
});



app.use(shopify.cspHeaders());
app.use(serveStatic(STATIC_PATH, { index: false }));


app.use("/*", shopify.ensureInstalledOnShop(), async (_req, res, _next) => {
  console.log('shopname', _req.query.shop)
  // console.log('shopname', _req)
  return res
    .status(200)
    .set("Content-Type", "text/html")
    .send(readFileSync(join(STATIC_PATH, "index.html")));
});

app.use(bodyParser.json());


app.get('/api/themes',   async (_req, res) => {
  console.log('retrive all the theme')
  try {
    const themes =await shopify.api.rest.Theme.all({
      session: res.locals.shopify.session,
      // id: 137987326206,
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

// const axios = require('axios');

// const shopifyApiEndpoint = 'https://your-development-store.myshopify.com/admin/api/2023-10/themes/137987326206.json';
// const accessToken = '{access_token}'; // Replace with your actual access token

// app.get('/api/themes/137987326206', async (_req, res) => {
//   console.log('API hit successful');
//   try {
//     const response = await axios.get(shopifyApiEndpoint, {
//       headers: {
//         'X-Shopify-Access-Token': accessToken,
//       },
//     });

//     const themes = response.data.theme;
//     console.log('Themes:', themes);

//     const responseData = {
//       themeId: themes.id,
//       name: themes.name,
//       // Add other properties you want to include in the response
//     };

//     console.log('Response:', responseData);
//     res.status(200).json(responseData);
//   } catch (error) {
//     console.error('Error retrieving theme:', error.response ? error.response.data : error.message);
//     res.status(error.response ? error.response.status : 500).json({ error: 'Internal Server Error' });
//   }
// });

// app.put('/admin/api/2023-04/themes/:id', async (_req, res) => {
//   const shopDomain = _req.query.shop;
//   const themeId = _req.params.id;

//   try {
//       const filePath = path.join(__dirname, 'themes', `${themeId}.liquid`);
//       let themeFileContent = await fs.readFile(filePath, 'utf-8');

//       // Comment out third-party scripts and extract src
//       const thirdPartyScriptRegex = /<script.*?src=["'](https?:\/\/(?!${shopDomain}).*?)["'].*?><\/script>/g;
//       let match;
//       let iframes = '';

//       while ((match = thirdPartyScriptRegex.exec(themeFileContent)) !== null) {
//           themeFileContent = themeFileContent.replace(match[0], `/* ${match[0]} */`);
//           iframes += `<iframe src="${match[1]}" loading="lazy" frameborder="0" allowfullscreen></iframe>\n`;
//       }

//       // Insert iframes at the end of the body or in the footer
//       const iframeInsertionPointRegex = /<\/body>/;
//       themeFileContent = themeFileContent.replace(iframeInsertionPointRegex, `${iframes}$&`);

//       await fs.writeFile(filePath, themeFileContent, 'utf-8');

//       res.json({ success: true });
//   } catch (error) {
//       console.error('Error modifying theme:', error.message);
//       res.status(500).json({ success: false, error: error.message });
//   }
// });

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

export default app;





