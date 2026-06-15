import { Layout } from "antd";
import { useLanguage } from "../i18n";
const { Content } = Layout;
export default function BlankLayout({ children }) {
  const { dir } = useLanguage();
  return (
    <Layout dir={dir}>
      <Content>{children}</Content>
    </Layout>
  );
}
