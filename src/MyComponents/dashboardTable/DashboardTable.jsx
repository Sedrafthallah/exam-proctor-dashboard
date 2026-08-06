import { Tag } from "antd";
import { useLanguage } from "../../i18n-context";
import MyTable from "../mytable/MyTable";

const data = [
  {
    key: "1",
    id: "#1001",
    customer: "Ahmad Ali",
    status: "completed",
    total: "$120",
    date: "2026-05-18",
  },
  {
    key: "2",
    id: "#1002",
    customer: "Sara Mohamed",
    status: "pending",
    total: "$80",
    date: "2026-05-19",
  },
  {
    key: "3",
    id: "#1003",
    customer: "Omar Khaled",
    status: "delivered",
    total: "$200",
    date: "2026-05-20",
  },
];

const statusColors = {
  completed: "green",
  pending: "orange",
  delivered: "blue",
};

export default function DashboardTable() {
  const { t } = useLanguage();
  const columns = [
    {
      title: t.table.order,
      dataIndex: "id",
    },
    {
      title: t.table.customer,
      dataIndex: "customer",
    },
    {
      title: t.table.status,
      dataIndex: "status",
      render: (status) => <Tag color={statusColors[status]}>{status}</Tag>,
    },
    {
      title: t.table.total,
      dataIndex: "total",
    },
    {
      title: t.table.date,
      dataIndex: "date",
    },
  ];

  return (
    <MyTable
      columns={columns}
      dataSource={data}
      pagination={false}
      size="small"
    />
  );
}
