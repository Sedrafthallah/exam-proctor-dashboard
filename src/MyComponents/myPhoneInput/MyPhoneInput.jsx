import { Select, Input } from "antd";
import { CircleFlag } from "react-circle-flags";
import MyRow from "../myRow/MyRow";
import MyCol from "../myCol/MyCol";

const countries = [
  {
    code: "+963",
    country: "sy",
  },
  {
    code: "+962",
    country: "jo",
  },
  {
    code: "+961",
    country: "lb",
  },
  {
    code: "+966",
    country: "sa",
  },
  {
    code: "+20",
    country: "eg",
  },
  {
    code: "+971",
    country: "ae",
  },
];

export default function MyPhoneInput({ value = {}, onChange }) {
  const triggerChange = (changedValue) => {
    onChange?.({
      countryCode: value.countryCode || "+963",
      flag: value.flag || "🇸🇾",
      phone: value.phone || "",
      ...value,
      ...changedValue,
    });
  };

  return (
    <MyRow gutter={12}>
      <MyCol span={9}>
        <Select
          value={value.countryCode || "+963"}
          style={{
            width: "100%",
          }}
          size="large"
          onChange={(val, option) => {
            triggerChange({
              countryCode: val,
              flag: option.flag,
            });
          }}
          options={countries.map((c) => ({
            value: c.code,

            label: (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <CircleFlag countryCode={c.country} height="20" />

                <span>{c.code}</span>
              </div>
            ),

            flag: c.flag,
          }))}
        />
      </MyCol>

      <MyCol span={15}>
        <Input
          value={value.phone || ""}
          onChange={(e) => {
            triggerChange({
              phone: e.target.value,
            });
          }}
          placeholder="930492567"
          size="large"
          style={{
            direction: "ltr",
            textAlign: "left",
          }}
        />
      </MyCol>
    </MyRow>
  );
}
