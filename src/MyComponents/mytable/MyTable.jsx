import { Table } from "antd";

export default function MyTable(props) {
  return (
    <Table
      {...props}
      size="middle"
      bordered
      scroll={{ x: true }}
      className="my-table"
    />
  );
}
