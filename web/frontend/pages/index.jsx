import {
  Card,
  Page,
  Layout,
  TextContainer,
  Image,
  Stack,
  Link,
  Text,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { useTranslation, Trans } from "react-i18next";

import { trophyImage } from "../assets";

import { ProductsCard } from "../components";
import axios from "axios";

export default function HomePage() {
  const { t } = useTranslation();

  
  // const [message, setMessage] = useState(null);
  // const [themeId, setThemeId] = useState(null);
  // const [shopDomain, setShopDomain] = useState(null);

  // useEffect(() => {
  //   // Fetch theme information
  //   const fetchThemeInfo = async () => {
  //     try {
  //       const response = await axios.get(
  //         "https://{Api_key}:{Secret_Token}@{Store_Name}.myshopify.com/admin/api/2021-10/themes.json"
  //       );

  //       // Replace with your logic to select the desired theme
  //       const selectedTheme = response.data.themes.find(
  //         (theme) => theme.name === "Refresh"
  //       );

  //       if (selectedTheme) {
  //         setThemeId(selectedTheme.id);
  //       }
  //     } catch (error) {
  //       console.error("Error fetching theme information:", error.message);
  //     }
  //   };

  //   // Fetch shop information
  //   const fetchShopInfo = async () => {
  //     try {
  //       const response = await axios.get(
  //         "https://{Api_key}:{Secret_Token}@{Store_Name}.myshopify.com/admin/api/2021-10/shop.json"
  //       );

  //       setShopDomain(response.data.shop.domain);
  //     } catch (error) {
  //       console.error("Error fetching shop information:", error.message);
  //     }
  //   };

  //   // Fetch theme and shop information
  //   fetchThemeInfo();
  //   fetchShopInfo();
  // }, []); // Run once on component mount


  // const modifyTheme = async (themeId, enableScripts) => {
  //   try {
  //     const response = await axios.put(`${API_BASE_URL}/modify-theme`, {
  //       themeId,
  //       enableScripts,
  //       shopDomain,
  //     });

  //     if (response.data.success) {
  //       setMessage("Theme modified successfully");
  //       // Update your React app's state or UI as needed
  //     } else {
  //       setMessage("Failed to modify theme: " + response.data.error);
  //     }
  //   } catch (error) {
  //     setMessage("Error modifying theme: " + error.message);
  //   }
  // };

  // const fetchFullyUncommentedTheme = async () => {
  //   try {
  //     const response = await axios.get(
  //       `${API_BASE_URL}/fully-uncommented-theme/${themeId}/${shopDomain}`
  //     );

  //     // Uncomment all third-party scripts and inject into the document
  //     const parser = new DOMParser();
  //     const htmlDocument = parser.parseFromString(response.data, "text/html");

  //     htmlDocument.querySelectorAll("script").forEach((script) => {
  //       // Remove comments from the script content
  //       const uncommentedScriptContent = script.innerHTML.replace(
  //         /\/\*|\*\//g,
  //         ""
  //       );

  //       // Create a new script element with uncommented content
  //       const newScript = document.createElement("script");
  //       newScript.innerHTML = uncommentedScriptContent;

  //       // Append the new script to the head of the document
  //       document.head.appendChild(newScript);
  //     });

  //     console.log("Fully uncommented theme content:", response.data);
  //   } catch (error) {
  //     console.error("Error fetching fully uncommented theme:", error.message);
  //   }
  // };

  // // Load fully uncommented theme after the window has loaded
  // useEffect(() => {
  //   if (themeId && shopDomain) {
  //     window.addEventListener("load", fetchFullyUncommentedTheme);
  //   }
  // }, [themeId, shopDomain]);

  return (
    <Page narrowWidth>
      <TitleBar title={t("HomePage.title")} primaryAction={null} />
      <Layout>
        <Layout.Section>
          <Card sectioned>
            <Stack
              wrap={false}
              spacing="extraTight"
              distribution="trailing"
              alignment="center"
            >
              <Stack.Item fill>
                <TextContainer spacing="loose">
                  <Text as="h2" variant="headingMd">
                    {t("HomePage.heading")}
                  </Text>

                  <p>{t("HomePage.startPopulatingYourApp")}</p>
                  
                </TextContainer>
              </Stack.Item>
              <Stack.Item>
                <div style={{ padding: "0 20px" }}>
                  <Image
                    source={trophyImage}
                    alt={t("HomePage.trophyAltText")}
                    width={120}
                  />
                </div>
              </Stack.Item>
            </Stack>
            <div>
                  {/* Display the message if available */}
                  {/* {message && <p>{message}</p>} */}

                  {/* Example usage: Call modifyTheme with your desired parameters */}
                  <button
                    // onClick={() =>
                    //   modifyTheme("yourThemeId", "yourScriptTagId", true)
                    // }
                  >
                    Modify Theme
                  </button>
                </div>
          </Card>
        </Layout.Section>
        <Layout.Section>
          <ProductsCard />
        </Layout.Section>
      </Layout>
    </Page>
  );
}
