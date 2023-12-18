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
  return res
    .status(200)
    .set("Content-Type", "text/html")
    .send(readFileSync(join(STATIC_PATH, "index.html")));
});

//

app.use(bodyParser.json());

app.put('/modify-theme', async (req, res) => {
  const { themeId, enableScripts } = req.body;

  try {
    // Read the theme file
    const filePath = path.join(__dirname, 'themes', `${themeId}.js`);
    let themeFileContent = fs.readFileSync(filePath, 'utf-8');

    // Define a regular expression to identify third-party scripts
    const thirdPartyScriptRegex = /<script.*?src=["'](https?:\/\/(?!causalfunnel-app-testing\.com).*?)["'].*?><\/script>/g;

    // Comment out or uncomment third-party scripts based on enableScripts flag
    themeFileContent = themeFileContent.replace(thirdPartyScriptRegex, (match, scriptUrl) => {
      return enableScripts ? match : `/* ${match} */`;
    });

    // Write the modified content back to the theme file
    fs.writeFileSync(filePath, themeFileContent, 'utf-8');

    // If enableScripts is true, also create/update a script tag using Shopify API
    if (enableScripts) {
      const shopifyResponse = await axios.put(`https://causalfunnel-app-testing/admin/api/2023-10/themes/137987326206.json`, {
        theme: {
          id: themeId,
          role: 'main',
        },
      });

      console.log('Shopify API Response:', shopifyResponse.data);
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error modifying theme:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// New endpoint to fetch fully uncommented theme file
app.get('/fully-uncommented-theme/:themeId', (req, res) => {
  const { themeId } = req.params;

  try {
    // Read the theme file
    const filePath = path.join(__dirname, 'themes', `${themeId}.js`);
    let themeFileContent = fs.readFileSync(filePath, 'utf-8');

    // Define a regular expression to identify commented third-party scripts
    const commentedScriptRegex = /\/\*<script.*?src=["'](https?:\/\/(?!causalfunnel-app-testing\.com).*?)["'].*?><\/script>\*\//g;

    // Uncomment all commented third-party scripts
    themeFileContent = themeFileContent.replace(commentedScriptRegex, (match, scriptUrl) => {
      return `<script src="${scriptUrl}"></script>`;
    });

    // Respond with the fully uncommented theme content
    res.send(themeFileContent);
  } catch (error) {
    console.error('Error reading theme file:', error.message);
    res.status(500).send('Internal Server Error');
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

export default app;





