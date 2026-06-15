import { Layout, Menu } from "antd";
import {
  DashboardOutlined,
  SettingOutlined,
  ShoppingOutlined,
  TagsOutlined,
  ShoppingCartOutlined,
  TeamOutlined,
  DatabaseOutlined,
  GiftOutlined,
} from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";
import { useLanguage } from "../../i18n";
const { Sider } = Layout;

export default function DashboardSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();

  const items = [
    {
      key: "/dashboard",
      icon: <DashboardOutlined />,
      label: t.Dashboard.dashboard,
    },
    {
      key: "/dashboard/products",
      icon: <ShoppingOutlined />,
      label: t.Dashboard.products,
    },
    {
      key: "/dashboard/customers",
      icon: <TeamOutlined />,
      label: t.Dashboard.customers,
    },
    {
      key: "/dashboard/categories",
      icon: <TagsOutlined />,
      label: t.Dashboard.categories,
    },
    {
      key: "/dashboard/orders",
      icon: <ShoppingCartOutlined />,
      label: t.Dashboard.orders,
    },

    {
      key: "/dashboard/stock",
      icon: <DatabaseOutlined />,
      label: t.Dashboard.stock,
    },
    {
      key: "/dashboard/offers",
      icon: <GiftOutlined />,
      label: t.Dashboard.offers,
    },
    {
      key: "/dashboard/settings",
      icon: <SettingOutlined />,
      label: t.Dashboard.settings,
    },
  ];

  return (
    <Sider width={220} collapsible>
      <Menu
        mode="inline"
        theme="dark"
        selectedKeys={[location.pathname]}
        onClick={({ key }) => navigate(key)}
        items={items}
        style={{
          borderInlineEnd: "none",
          paddingTop: 16,
          height: "100%",
        }}
      />
    </Sider>
  );
}
