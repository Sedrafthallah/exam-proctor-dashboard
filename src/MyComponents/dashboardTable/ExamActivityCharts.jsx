import { theme, Flex } from "antd";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { BarChartOutlined } from "@ant-design/icons";
import MyCard from "../../MyComponents/myCard/MyCard";
import MyText from "../../MyComponents/myText/MyText";

export default function ExamActivityChart({ data = [] }) {
  const { token } = theme.useToken();

  return (
    <MyCard
      title={
        <Flex align="center" gap={8}>
          <BarChartOutlined
            style={{ color: token.colorPrimary, fontSize: 16 }}
          />
          <MyText strong>Exam Activity — last 7 days</MyText>
        </Flex>
      }
      style={{
        width: "100%",
        height: 310,
        borderRadius: 14,
        boxShadow: token.boxShadow,
        border: `1px solid ${token.colorBorder}`,
        background: token.colorBgElevated,
      }}
    >
      <Flex style={{ width: "100%", height: 220, marginTop: 5 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 5, right: 10, left: -25, bottom: 0 }}
            barGap={4}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={token.colorBorderSecondary}
              vertical={false}
            />
            <XAxis
              dataKey="day"
              tick={{ fill: token.colorTextDescription, fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: token.colorTextDescription, fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              domain={[0, 12]}
            />
            <Tooltip
              contentStyle={{
                background: token.colorBgElevated,
                borderColor: token.colorBorder,
                borderRadius: 8,
                color: token.colorText,
              }}
              cursor={{ fill: token.colorFillSecondary, opacity: 0.3 }}
            />
            <Legend
              verticalAlign="top"
              align="right"
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ paddingBottom: 15, fontSize: 11 }}
            />
            <Bar
              name="Sessions"
              dataKey="sessions"
              fill="#2f54eb"
              radius={[3, 3, 0, 0]}
              barSize={12}
            />
            <Bar
              name="Submissions"
              dataKey="submissions"
              fill="#9254de"
              radius={[3, 3, 0, 0]}
              barSize={12}
            />
          </BarChart>
        </ResponsiveContainer>
      </Flex>
    </MyCard>
  );
}
