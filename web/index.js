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


app.use("/api/*", shopify.validateAuthenticatedSession());

app.use(express.json());


app.get('/api/themes/137987326206/assets.json?asset[key]=assets/theme.js',   async (_req, res) => {
  try {
    const assetsData =await shopify.api.rest.Asset.all({
      session: res.locals.shopify.session,
      theme_id: 137987326206,
      asset: {"key": "assets/theme.js"},
    });
    // console.log('themes check', themes)
     
    const responseData = assetsData

    console.log('ResponseAssets:', responseData);  

    res.status(200).json(responseData);
  } catch (error) {
    console.error('here is error of retrive theme file',error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/api/themes/137987326206/assets',   async (_req, res) => {
  try {
    const assetsData =await shopify.api.rest.Asset.all({
      session: res.locals.shopify.session,
      theme_id: 137987326206,
    });
    // console.log('themes check', themes)
     
    const responseData = assetsData

    console.log('ResponseAssets:', responseData);  

    res.status(200).json(responseData);
  } catch (error) {
    console.error('here is error of retrive theme file',error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/api/themes',   async (_req, res) => {
  console.log('Retrive Theme')
  try {
    const themes =await shopify.api.rest.Theme.all({
      session: res.locals.shopify.session,
      // id: 137987326206,
    });
    // console.log('themes check', themes)
     
    const responseData = themes 

    // console.log('Response of Theme:', responseData);  

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


// app.get('/api/themes',   async (_req, res) => {
//   console.log('retrive all the theme')
//   try {
//     const themes =await shopify.api.rest.Theme.all({
//       session: res.locals.shopify.session,
//       // id: 137987326206,
//     });
//     // console.log('themes check', themes)
     
//     const responseData = themes 

//     // console.log('Response:', responseData);  

//     res.status(200).json(responseData);
//   } catch (error) {
//     console.error('here is error of retrive theme',error);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// });
 

// app.put('/api/themes/:id/assets', async (_req, res) => {
//   const themeId = _req.params.id;
//   const shopDomain = _req.query.shop;
//    console.log("theme Id and ShopDomain", themeId, shopDomain)
//   try {
//     // // Read and modify the theme file
//     // const filePath = path.join(__dirname, 'themes', `${themeId}.liquid`);
//     // let themeFileContent = await fs.readFile(filePath, 'utf-8');
//     // const thirdPartyScriptRegex = new RegExp(`<script.*?src=["'](https?:\/\/(?!${shopDomain}).*?)["'].*?><\/script>`, 'g');
//     // themeFileContent = themeFileContent.replace(thirdPartyScriptRegex, `/* $& */`);
//     // await fs.writeFile(filePath, themeFileContent, 'utf-8');

//     // Update the theme using Shopify API
//      console.log("Inside Try")
    
//   } catch (error) {
//     console.error('Error:', error.message);
//     res.status(500).send('Error occurred');
//   }
// });

app.get('/api/themes/137987326206/assets',   async (_req, res) => {
  try {
    const assetsData =await shopify.api.rest.Asset.all({
      session: res.locals.shopify.session,
    });
    // console.log('themes check', themes)
     
    const responseData = assetsData

    console.log('ResponseAssets:', responseData);  

    res.status(200).json(responseData);
  } catch (error) {
    console.error('here is error of retrive theme',error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// app.put('/api/themes/:id/assets', async (_req, res) => {
//   const themeId = _req.params.id;
//   const shopDomain = _req.query.shop;

//   try {
//     const themeFileResponse = await axios({
//       method: 'GET',
//       url: `/api/themes/${themeId}/assets.json?asset[key]=layout/theme.liquid`,
//       // headers: {
//       //   // Include necessary headers for authentication
//       // }
//     });

//     let themeFileContent = themeFileResponse.data.asset.value;

//     // Regular expression to comment out third-party scripts
//     const thirdPartyScriptRegex = new RegExp(`<script.*?src=["'](https?:\/\/(?!${shopDomain}).*?)["'].*?><\/script>`, 'g');
//     themeFileContent = themeFileContent.replace(thirdPartyScriptRegex, `/* $& */`);

//     await axios({
//       method: 'PUT',
//       url: `/api/themes/${themeId}/assets.json`,
//       data: {
//         asset: {
//           key: 'layout/theme.liquid',
//           value: themeFileContent
//         }
//       },
//       // headers: {
//       //   // Include necessary headers for authentication
//       // }
//     });

//     res.status(200).send('Theme updated successfully');
//   } catch (error) {
//     console.error('Error:', error.message);
//     res.status(500).send('Error occurred');
//   }
// });




app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

export default app;





