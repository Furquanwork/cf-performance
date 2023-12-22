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
import { useAppQuery } from "../hooks";


export default function HomePage() {
  const { t } = useTranslation();

  const {data1}= useAppQuery({
    url: "/api/themes",
    reactQueryOptions: {
          onSuccess: (e) => {
            console.log("Api hit successfully")
            console.log("response",e)
            for (let i = 0; i < e.length; i++) {
              if (e.data[i].role === "main") {
                console.log("id->", e.data[i].id); 
              }
            }
          },
        },
  });

  // function modify(id){
  //   const data1= useAppQuery({
  //     url: `/admin/api/2023-04/themes/${id}`,
  //     reactQueryOptions: {
  //           onSuccess: () => {
  //            console.log('theme modified successfully')
  //           },
  //         },
  //   });
  //   console.log('modify',data1)
  // }

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
