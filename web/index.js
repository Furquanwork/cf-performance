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


app.get('/api/the/137987326206/assets', async (_req, res) => {
  // const {key, value, theme_id} = _req.body;
  const key="layout/theme.liquid"
  const theme_id=137987326206;
  const value = "<!doctype html>\n<html class=\"no-js\" lang=\"{{ request.locale.iso_code }}\">\n  <head>\n    <meta charset=\"utf-8\">\n    <meta http-equiv=\"X-UA-Compatible\" content=\"IE=edge\">\n    <meta name=\"viewport\" content=\"width=device-width,initial-scale=1\">\n    <meta name=\"theme-color\" content=\"\">\n    <link rel=\"canonical\" href=\"{{ canonical_url }}\">\n\n    {%- if settings.favicon != blank -%}\n      <link rel=\"icon\" type=\"image/png\" href=\"{{ settings.favicon | image_url: width: 32, height: 32 }}\">\n    {%- endif -%}\n\n    {%- unless settings.type_header_font.system? and settings.type_body_font.system? -%}\n      <link rel=\"preconnect\" href=\"https://fonts.shopifycdn.com\" crossorigin>\n    {%- endunless -%}\n\n    <title>\n      {{ page_title }}\n      {%- if current_tags %} &ndash; tagged \"{{ current_tags | join: ', ' }}\"{% endif -%}\n      {%- if current_page != 1 %} &ndash; Page {{ current_page }}{% endif -%}\n      {%- unless page_title contains shop.name %} &ndash; {{ shop.name }}{% endunless -%}\n    </title>\n\n    {% if page_description %}\n      <meta name=\"description\" content=\"{{ page_description | escape }}\">\n    {% endif %}\n\n    {% render 'meta-tags' %}\n\n    <script src=\"{{ 'constants.js' | asset_url }}\" defer=\"defer\"></script>\n    <script src=\"{{ 'pubsub.js' | asset_url }}\" defer=\"defer\"></script>\n    <script src=\"{{ 'global.js' | asset_url }}\" defer=\"defer\"></script>\n    {%- if settings.animations_reveal_on_scroll -%}\n      <script src=\"{{ 'animations.js' | asset_url }}\" defer=\"defer\"></script>\n    {%- endif -%}\n\n    {{ content_for_header }}\n\n    {%- liquid\n      assign body_font_bold = settings.type_body_font | font_modify: 'weight', 'bold'\n      assign body_font_italic = settings.type_body_font | font_modify: 'style', 'italic'\n      assign body_font_bold_italic = body_font_bold | font_modify: 'style', 'italic'\n    %}\n\n    {% style %}\n      {{ settings.type_body_font | font_face: font_display: 'swap' }}\n      {{ body_font_bold | font_face: font_display: 'swap' }}\n      {{ body_font_italic | font_face: font_display: 'swap' }}\n      {{ body_font_bold_italic | font_face: font_display: 'swap' }}\n      {{ settings.type_header_font | font_face: font_display: 'swap' }}\n\n      {% for scheme in settings.color_schemes -%}\n        {% assign scheme_classes = scheme_classes | append: ', .color-' | append: scheme.id %}\n        {% if forloop.index == 1 -%}\n          :root,\n        {%- endif %}\n        .color-{{ scheme.id }} {\n          --color-background: {{ scheme.settings.background.red }},{{ scheme.settings.background.green }},{{ scheme.settings.background.blue }};\n        {% if scheme.settings.background_gradient != empty %}\n          --gradient-background: {{ scheme.settings.background_gradient }};\n        {% else %}\n          --gradient-background: {{ scheme.settings.background }};\n        {% endif %}\n\n        {% liquid\n          assign background_color = scheme.settings.background\n          assign background_color_brightness = background_color | color_brightness\n          if background_color_brightness <= 26\n            assign background_color_contrast = background_color | color_lighten: 50\n          elsif background_color_brightness <= 65\n            assign background_color_contrast = background_color | color_lighten: 5\n          else\n            assign background_color_contrast = background_color | color_darken: 25\n          endif\n        %}\n\n        --color-foreground: {{ scheme.settings.text.red }},{{ scheme.settings.text.green }},{{ scheme.settings.text.blue }};\n        --color-background-contrast: {{ background_color_contrast.red }},{{ background_color_contrast.green }},{{ background_color_contrast.blue }};\n        --color-shadow: {{ scheme.settings.shadow.red }},{{ scheme.settings.shadow.green }},{{ scheme.settings.shadow.blue }};\n        --color-button: {{ scheme.settings.button.red }},{{ scheme.settings.button.green }},{{ scheme.settings.button.blue }};\n        --color-button-text: {{ scheme.settings.button_label.red }},{{ scheme.settings.button_label.green }},{{ scheme.settings.button_label.blue }};\n        --color-secondary-button: {{ scheme.settings.background.red }},{{ scheme.settings.background.green }},{{ scheme.settings.background.blue }};\n        --color-secondary-button-text: {{ scheme.settings.secondary_button_label.red }},{{ scheme.settings.secondary_button_label.green }},{{ scheme.settings.secondary_button_label.blue }};\n        --color-link: {{ scheme.settings.secondary_button_label.red }},{{ scheme.settings.secondary_button_label.green }},{{ scheme.settings.secondary_button_label.blue }};\n        --color-badge-foreground: {{ scheme.settings.text.red }},{{ scheme.settings.text.green }},{{ scheme.settings.text.blue }};\n        --color-badge-background: {{ scheme.settings.background.red }},{{ scheme.settings.background.green }},{{ scheme.settings.background.blue }};\n        --color-badge-border: {{ scheme.settings.text.red }},{{ scheme.settings.text.green }},{{ scheme.settings.text.blue }};\n        --payment-terms-background-color: rgb({{ scheme.settings.background.rgb }});\n      }\n      {% endfor %}\n\n      {{ scheme_classes | prepend: 'body' }} {\n        color: rgba(var(--color-foreground), 0.75);\n        background-color: rgb(var(--color-background));\n      }\n\n      :root {\n        --font-body-family: {{ settings.type_body_font.family }}, {{ settings.type_body_font.fallback_families }};\n        --font-body-style: {{ settings.type_body_font.style }};\n        --font-body-weight: {{ settings.type_body_font.weight }};\n        --font-body-weight-bold: {{ settings.type_body_font.weight | plus: 300 | at_most: 1000 }};\n\n        --font-heading-family: {{ settings.type_header_font.family }}, {{ settings.type_header_font.fallback_families }};\n        --font-heading-style: {{ settings.type_header_font.style }};\n        --font-heading-weight: {{ settings.type_header_font.weight }};\n\n        --font-body-scale: {{ settings.body_scale | divided_by: 100.0 }};\n        --font-heading-scale: {{ settings.heading_scale | times: 1.0 | divided_by: settings.body_scale }};\n\n        --media-padding: {{ settings.media_padding }}px;\n        --media-border-opacity: {{ settings.media_border_opacity | divided_by: 100.0 }};\n        --media-border-width: {{ settings.media_border_thickness }}px;\n        --media-radius: {{ settings.media_radius }}px;\n        --media-shadow-opacity: {{ settings.media_shadow_opacity | divided_by: 100.0 }};\n        --media-shadow-horizontal-offset: {{ settings.media_shadow_horizontal_offset }}px;\n        --media-shadow-vertical-offset: {{ settings.media_shadow_vertical_offset }}px;\n        --media-shadow-blur-radius: {{ settings.media_shadow_blur }}px;\n        --media-shadow-visible: {% if settings.media_shadow_opacity > 0 %}1{% else %}0{% endif %};\n\n        --page-width: {{ settings.page_width | divided_by: 10 }}rem;\n        --page-width-margin: {% if settings.page_width == '1600' %}2{% else %}0{% endif %}rem;\n\n        --product-card-image-padding: {{ settings.card_image_padding | divided_by: 10.0 }}rem;\n        --product-card-corner-radius: {{ settings.card_corner_radius | divided_by: 10.0 }}rem;\n        --product-card-text-alignment: {{ settings.card_text_alignment }};\n        --product-card-border-width: {{ settings.card_border_thickness | divided_by: 10.0 }}rem;\n        --product-card-border-opacity: {{ settings.card_border_opacity | divided_by: 100.0 }};\n        --product-card-shadow-opacity: {{ settings.card_shadow_opacity | divided_by: 100.0 }};\n        --product-card-shadow-visible: {% if settings.card_shadow_opacity > 0 %}1{% else %}0{% endif %};\n        --product-card-shadow-horizontal-offset: {{ settings.card_shadow_horizontal_offset | divided_by: 10.0 }}rem;\n        --product-card-shadow-vertical-offset: {{ settings.card_shadow_vertical_offset | divided_by: 10.0 }}rem;\n        --product-card-shadow-blur-radius: {{ settings.card_shadow_blur | divided_by: 10.0 }}rem;\n\n        --collection-card-image-padding: {{ settings.collection_card_image_padding | divided_by: 10.0 }}rem;\n        --collection-card-corner-radius: {{ settings.collection_card_corner_radius | divided_by: 10.0 }}rem;\n        --collection-card-text-alignment: {{ settings.collection_card_text_alignment }};\n        --collection-card-border-width: {{ settings.collection_card_border_thickness | divided_by: 10.0 }}rem;\n        --collection-card-border-opacity: {{ settings.collection_card_border_opacity | divided_by: 100.0 }};\n        --collection-card-shadow-opacity: {{ settings.collection_card_shadow_opacity | divided_by: 100.0 }};\n        --collection-card-shadow-visible: {% if settings.collection_card_shadow_opacity > 0 %}1{% else %}0{% endif %};\n        --collection-card-shadow-horizontal-offset: {{ settings.collection_card_shadow_horizontal_offset | divided_by: 10.0 }}rem;\n        --collection-card-shadow-vertical-offset: {{ settings.collection_card_shadow_vertical_offset | divided_by: 10.0 }}rem;\n        --collection-card-shadow-blur-radius: {{ settings.collection_card_shadow_blur | divided_by: 10.0 }}rem;\n\n        --blog-card-image-padding: {{ settings.blog_card_image_padding | divided_by: 10.0 }}rem;\n        --blog-card-corner-radius: {{ settings.blog_card_corner_radius | divided_by: 10.0 }}rem;\n        --blog-card-text-alignment: {{ settings.blog_card_text_alignment }};\n        --blog-card-border-width: {{ settings.blog_card_border_thickness | divided_by: 10.0 }}rem;\n        --blog-card-border-opacity: {{ settings.blog_card_border_opacity | divided_by: 100.0 }};\n        --blog-card-shadow-opacity: {{ settings.blog_card_shadow_opacity | divided_by: 100.0 }};\n        --blog-card-shadow-visible: {% if settings.blog_card_shadow_opacity > 0 %}1{% else %}0{% endif %};\n        --blog-card-shadow-horizontal-offset: {{ settings.blog_card_shadow_horizontal_offset | divided_by: 10.0 }}rem;\n        --blog-card-shadow-vertical-offset: {{ settings.blog_card_shadow_vertical_offset | divided_by: 10.0 }}rem;\n        --blog-card-shadow-blur-radius: {{ settings.blog_card_shadow_blur | divided_by: 10.0 }}rem;\n\n        --badge-corner-radius: {{ settings.badge_corner_radius | divided_by: 10.0 }}rem;\n\n        --popup-border-width: {{ settings.popup_border_thickness }}px;\n        --popup-border-opacity: {{ settings.popup_border_opacity | divided_by: 100.0 }};\n        --popup-corner-radius: {{ settings.popup_corner_radius }}px;\n        --popup-shadow-opacity: {{ settings.popup_shadow_opacity | divided_by: 100.0 }};\n        --popup-shadow-horizontal-offset: {{ settings.popup_shadow_horizontal_offset }}px;\n        --popup-shadow-vertical-offset: {{ settings.popup_shadow_vertical_offset }}px;\n        --popup-shadow-blur-radius: {{ settings.popup_shadow_blur }}px;\n\n        --drawer-border-width: {{ settings.drawer_border_thickness }}px;\n        --drawer-border-opacity: {{ settings.drawer_border_opacity | divided_by: 100.0 }};\n        --drawer-shadow-opacity: {{ settings.drawer_shadow_opacity | divided_by: 100.0 }};\n        --drawer-shadow-horizontal-offset: {{ settings.drawer_shadow_horizontal_offset }}px;\n        --drawer-shadow-vertical-offset: {{ settings.drawer_shadow_vertical_offset }}px;\n        --drawer-shadow-blur-radius: {{ settings.drawer_shadow_blur }}px;\n\n        --spacing-sections-desktop: {{ settings.spacing_sections }}px;\n        --spacing-sections-mobile: {% if settings.spacing_sections < 24 %}{{ settings.spacing_sections }}{% else %}{{ settings.spacing_sections | times: 0.7 | round | at_least: 20 }}{% endif %}px;\n\n        --grid-desktop-vertical-spacing: {{ settings.spacing_grid_vertical }}px;\n        --grid-desktop-horizontal-spacing: {{ settings.spacing_grid_horizontal }}px;\n        --grid-mobile-vertical-spacing: {{ settings.spacing_grid_vertical | divided_by: 2 }}px;\n        --grid-mobile-horizontal-spacing: {{ settings.spacing_grid_horizontal | divided_by: 2 }}px;\n\n        --text-boxes-border-opacity: {{ settings.text_boxes_border_opacity | divided_by: 100.0 }};\n        --text-boxes-border-width: {{ settings.text_boxes_border_thickness }}px;\n        --text-boxes-radius: {{ settings.text_boxes_radius }}px;\n        --text-boxes-shadow-opacity: {{ settings.text_boxes_shadow_opacity | divided_by: 100.0 }};\n        --text-boxes-shadow-visible: {% if settings.text_boxes_shadow_opacity > 0 %}1{% else %}0{% endif %};\n        --text-boxes-shadow-horizontal-offset: {{ settings.text_boxes_shadow_horizontal_offset }}px;\n        --text-boxes-shadow-vertical-offset: {{ settings.text_boxes_shadow_vertical_offset }}px;\n        --text-boxes-shadow-blur-radius: {{ settings.text_boxes_shadow_blur }}px;\n\n        --buttons-radius: {{ settings.buttons_radius }}px;\n        --buttons-radius-outset: {% if settings.buttons_radius > 0 %}{{ settings.buttons_radius | plus: settings.buttons_border_thickness }}{% else %}0{% endif %}px;\n        --buttons-border-width: {% if settings.buttons_border_opacity > 0 %}{{ settings.buttons_border_thickness }}{% else %}0{% endif %}px;\n        --buttons-border-opacity: {{ settings.buttons_border_opacity | divided_by: 100.0 }};\n        --buttons-shadow-opacity: {{ settings.buttons_shadow_opacity | divided_by: 100.0 }};\n        --buttons-shadow-visible: {% if settings.buttons_shadow_opacity > 0 %}1{% else %}0{% endif %};\n        --buttons-shadow-horizontal-offset: {{ settings.buttons_shadow_horizontal_offset }}px;\n        --buttons-shadow-vertical-offset: {{ settings.buttons_shadow_vertical_offset }}px;\n        --buttons-shadow-blur-radius: {{ settings.buttons_shadow_blur }}px;\n        --buttons-border-offset: {% if settings.buttons_radius > 0 or settings.buttons_shadow_opacity > 0 %}0.3{% else %}0{% endif %}px;\n\n        --inputs-radius: {{ settings.inputs_radius }}px;\n        --inputs-border-width: {{ settings.inputs_border_thickness }}px;\n        --inputs-border-opacity: {{ settings.inputs_border_opacity | divided_by: 100.0 }};\n        --inputs-shadow-opacity: {{ settings.inputs_shadow_opacity | divided_by: 100.0 }};\n        --inputs-shadow-horizontal-offset: {{ settings.inputs_shadow_horizontal_offset }}px;\n        --inputs-margin-offset: {% if settings.inputs_shadow_vertical_offset != 0 and settings.inputs_shadow_opacity > 0 %}{{ settings.inputs_shadow_vertical_offset | abs }}{% else %}0{% endif %}px;\n        --inputs-shadow-vertical-offset: {{ settings.inputs_shadow_vertical_offset }}px;\n        --inputs-shadow-blur-radius: {{ settings.inputs_shadow_blur }}px;\n        --inputs-radius-outset: {% if settings.inputs_radius > 0 %}{{ settings.inputs_radius | plus: settings.inputs_border_thickness }}{% else %}0{% endif %}px;\n\n        --variant-pills-radius: {{ settings.variant_pills_radius }}px;\n        --variant-pills-border-width: {{ settings.variant_pills_border_thickness }}px;\n        --variant-pills-border-opacity: {{ settings.variant_pills_border_opacity | divided_by: 100.0 }};\n        --variant-pills-shadow-opacity: {{ settings.variant_pills_shadow_opacity | divided_by: 100.0 }};\n        --variant-pills-shadow-horizontal-offset: {{ settings.variant_pills_shadow_horizontal_offset }}px;\n        --variant-pills-shadow-vertical-offset: {{ settings.variant_pills_shadow_vertical_offset }}px;\n        --variant-pills-shadow-blur-radius: {{ settings.variant_pills_shadow_blur }}px;\n      }\n\n      *,\n      *::before,\n      *::after {\n        box-sizing: inherit;\n      }\n\n      html {\n        box-sizing: border-box;\n        font-size: calc(var(--font-body-scale) * 62.5%);\n        height: 100%;\n      }\n\n      body {\n        display: grid;\n        grid-template-rows: auto auto 1fr auto;\n        grid-template-columns: 100%;\n        min-height: 100%;\n        margin: 0;\n        font-size: 1.5rem;\n        letter-spacing: 0.06rem;\n        line-height: calc(1 + 0.8 / var(--font-body-scale));\n        font-family: var(--font-body-family);\n        font-style: var(--font-body-style);\n        font-weight: var(--font-body-weight);\n      }\n\n      @media screen and (min-width: 750px) {\n        body {\n          font-size: 1.6rem;\n        }\n      }\n    {% endstyle %}\n\n    {{ 'base.css' | asset_url | stylesheet_tag }}\n\n    {%- unless settings.type_body_font.system? -%}\n      <link rel=\"preload\" as=\"font\" href=\"{{ settings.type_body_font | font_url }}\" type=\"font/woff2\" crossorigin>\n    {%- endunless -%}\n    {%- unless settings.type_header_font.system? -%}\n      <link rel=\"preload\" as=\"font\" href=\"{{ settings.type_header_font | font_url }}\" type=\"font/woff2\" crossorigin>\n    {%- endunless -%}\n\n    {%- if localization.available_countries.size > 1 or localization.available_languages.size > 1 -%}\n      {{ 'component-localization-form.css' | asset_url | stylesheet_tag: preload: true }}\n      <script src=\"{{ 'localization-form.js' | asset_url }}\" defer=\"defer\"></script>\n    {%- endif -%}\n\n    {%- if settings.predictive_search_enabled -%}\n      <link\n        rel=\"stylesheet\"\n        href=\"{{ 'component-predictive-search.css' | asset_url }}\"\n        media=\"print\"\n        onload=\"this.media='all'\"\n      >\n    {%- endif -%}\n\n    <script>\n      document.documentElement.className = document.documentElement.className.replace('no-js', 'js');\n      if (Shopify.designMode) {\n        document.documentElement.classList.add('shopify-design-mode');\n      }\n    </script>\n  </head>\n\n  <body class=\"gradient{% if settings.animations_hover_elements != 'none' %} animate--hover-{{ settings.animations_hover_elements }}{% endif %}\">\n    <a class=\"skip-to-content-link button visually-hidden\" href=\"#MainContent\">\n      {{ 'accessibility.skip_to_text' | t }}\n    </a>\n\n    {%- if settings.cart_type == 'drawer' -%}\n      {%- render 'cart-drawer' -%}\n    {%- endif -%}\n\n    {% sections 'header-group' %}\n\n    <main id=\"MainContent\" class=\"content-for-layout focus-none\" role=\"main\" tabindex=\"-1\">\n      {{ content_for_layout }}\n    </main>\n\n    {% sections 'footer-group' %}\n\n    <ul hidden>\n      <li id=\"a11y-refresh-page-message\">{{ 'accessibility.refresh_page' | t }}</li>\n      <li id=\"a11y-new-window-message\">{{ 'accessibility.link_messages.new_window' | t }}</li>\n    </ul>\n\n    <script>\n      window.shopUrl = '{{ request.origin }}';\n      window.routes = {\n        cart_add_url: '{{ routes.cart_add_url }}',\n        cart_change_url: '{{ routes.cart_change_url }}',\n        cart_update_url: '{{ routes.cart_update_url }}',\n        cart_url: '{{ routes.cart_url }}',\n        predictive_search_url: '{{ routes.predictive_search_url }}',\n      };\n\n      window.cartStrings = {\n        error: `{{ 'sections.cart.cart_error' | t }}`,\n        quantityError: `{{ 'sections.cart.cart_quantity_error_html' | t: quantity: '[quantity]' }}`,\n      };\n\n      window.variantStrings = {\n        addToCart: `{{ 'products.product.add_to_cart' | t }}`,\n        soldOut: `{{ 'products.product.sold_out' | t }}`,\n        unavailable: `{{ 'products.product.unavailable' | t }}`,\n        unavailable_with_option: `{{ 'products.product.value_unavailable' | t: option_value: '[value]' }}`,\n      };\n\n      window.quickOrderListStrings = {\n        itemsAdded: `{{ 'sections.quick_order_list.items_added.other' | t: quantity: '[quantity]' }}`,\n        itemAdded: `{{ 'sections.quick_order_list.items_added.one' | t: quantity: '[quantity]' }}`,\n        itemsRemoved: `{{ 'sections.quick_order_list.items_removed.other' | t: quantity: '[quantity]' }}`,\n        itemRemoved: `{{ 'sections.quick_order_list.items_removed.one' | t: quantity: '[quantity]' }}`,\n        viewCart: `{{- 'sections.quick_order_list.view_cart' | t -}}`,\n        each: `{{- 'sections.quick_order_list.each' | t: money: '[money]' }}`,\n      };\n\n      window.accessibilityStrings = {\n        imageAvailable: `{{ 'products.product.media.image_available' | t: index: '[index]' }}`,\n        shareSuccess: `{{ 'general.share.success_message' | t }}`,\n        pauseSlideshow: `{{ 'sections.slideshow.pause_slideshow' | t }}`,\n        playSlideshow: `{{ 'sections.slideshow.play_slideshow' | t }}`,\n        recipientFormExpanded: `{{ 'recipient.form.expanded' | t }}`,\n        recipientFormCollapsed: `{{ 'recipient.form.collapsed' | t }}`,\n      };\n    </script>\n\n    {%- if settings.predictive_search_enabled -%}\n      <script src=\"{{ 'predictive-search.js' | asset_url }}\" defer=\"defer\"></script>\n    {%- endif -%}\n  </body>\n</html>\n"
  // const shopDomain = _req.query.shop;

  try {
     const asset = new shopify.api.rest.Asset({session: res.locals.shopify.session});
    asset.theme_id = theme_id;
    asset.key = key;
    // //new RegExp(`<script.*?src=["'](https?:\/\/(?!${shopDomain}).*?)["'].*?><\/script>`, 'g')
    // const thirdPartyScriptRegex = "no-js";
    // const new_value = value.replace(thirdPartyScriptRegex, `yes.js`);
    asset.value = value;
    await asset.save({
      update: true,
    });
    console.log("res haa bhai chal gya ")
    res.status(200).send({'sucess': true})
    
  } catch (error) {
    console.error('Error:', error.message);
    res.status(501).send('Error occurred');
  }
});

app.get('/api/theme/137987326206/assets',   async (_req, res) => {
  try {
    const assetsFileData =await shopify.api.rest.Asset.all({
      session: res.locals.shopify.session,
      theme_id: 137987326206,
      asset: {"key": 'layout/theme.liquid'},
    });
    // console.log('themes check', themes)
     
    const responseData = assetsFileData;

    // console.log('AssetsCode:', responseData);  

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

    // console.log('ResponseAssets:', responseData);  

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
  return res
    .status(200)
    .set("Content-Type", "text/html")
    .send(readFileSync(join(STATIC_PATH, "index.html")));
});

app.use(bodyParser.json());

 

// app.put('/api/themes/137987326206/assets', async (_req, res) => {
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





app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

export default app;





