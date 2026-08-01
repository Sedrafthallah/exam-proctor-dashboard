import { theme, Flex, Slider, Segmented, Switch, InputNumber, message } from "antd";
import { VideoCameraOutlined, ClockCircleOutlined, SaveOutlined, SettingOutlined } from "@ant-design/icons";
import MyTitle from "../../MyComponents/MyTitle/MyTitle";
import MyText from "../../MyComponents/myText/MyText";
import MyCard from "../../MyComponents/myCard/MyCard";
import MyForm from "../../MyComponents/myForm/MyForm";
import MyRow from "../../MyComponents/myRow/MyRow";
import MyCol from "../../MyComponents/myCol/MyCol";
import MyButtonPrimary from "../../MyComponents/myButton/MyButtonPrimary";
import useSettingsStore from "../../store/useSettingsStore";

const FACE_ALERT_OPTIONS = ["Low", "Medium", "High"];

function SectionCard({ icon, title, children, token }) {
  return (
    <MyCard
      title={
        <Flex align="center" gap={8}>
          {icon}
          <MyText strong>{title}</MyText>
        </Flex>
      }
      style={{
        borderRadius: 14,
        boxShadow: token.boxShadow,
        border: `1px solid ${token.colorBorder}`,
        background: token.colorBgElevated,
      }}
    >
      {children}
    </MyCard>
  );
}

export default function Settings() {
  const { token } = theme.useToken();
  const settings = useSettingsStore((state) => state.settings);
  const updateSettings = useSettingsStore((state) => state.updateSettings);
  const [form] = MyForm.useForm();

  const handleSave = (values) => {
    updateSettings(values);
    message.success("Settings saved.");
  };

  return (
    <Flex vertical gap={20}>
      <Flex align="center" gap={12}>
        <Flex
          align="center"
          justify="center"
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            background: `linear-gradient(135deg, ${token.colorPrimary}, ${token.colorPrimaryActive})`,
            boxShadow: `0 6px 16px -6px ${token.colorPrimary}`,
            flexShrink: 0,
          }}
        >
          <SettingOutlined style={{ fontSize: 20, color: "#fff" }} />
        </Flex>
        <Flex vertical gap={2}>
          <MyTitle level={3} style={{ margin: 0, color: token.colorText }}>
            System Settings
          </MyTitle>
          <MyText type="secondary">
            Platform-wide defaults for proctoring and session behavior.
          </MyText>
        </Flex>
      </Flex>

      <MyForm form={form} layout="vertical" initialValues={settings} onFinish={handleSave}>
        <Flex vertical gap={20}>
          <SectionCard
            token={token}
            icon={<VideoCameraOutlined style={{ fontSize: 16, color: token.colorPrimary }} />}
            title="Default Monitoring Thresholds"
          >
            <MyRow gutter={[24, 16]}>
              <MyCol xs={24} md={10}>
                <MyText style={{ fontSize: 13, display: "block", marginBottom: 8 }}>
                  Gaze alert threshold
                </MyText>
                <Flex align="center" gap={12}>
                  <MyForm.Item name="gazeThreshold" noStyle>
                    <Slider min={1} max={10} style={{ flex: 1 }} />
                  </MyForm.Item>
                  <MyForm.Item shouldUpdate noStyle>
                    {() => (
                      <MyText strong style={{ fontSize: 13, minWidth: 24 }}>
                        {form.getFieldValue("gazeThreshold")}s
                      </MyText>
                    )}
                  </MyForm.Item>
                </Flex>
              </MyCol>

              <MyCol xs={24} md={9}>
                <MyText style={{ fontSize: 13, display: "block", marginBottom: 8 }}>
                  Face sensitivity
                </MyText>
                <MyForm.Item name="faceAlertSensitivity" noStyle>
                  <Segmented
                    block
                    options={FACE_ALERT_OPTIONS}
                  />
                </MyForm.Item>
              </MyCol>

              <MyCol xs={24} md={5}>
                <MyText style={{ fontSize: 13, display: "block", marginBottom: 8 }}>
                  Ambient audio monitoring
                </MyText>
                <MyForm.Item name="audioMonitoring" valuePropName="checked" noStyle>
                  <Switch checkedChildren="Enabled" unCheckedChildren="Disabled" />
                </MyForm.Item>
              </MyCol>
            </MyRow>
          </SectionCard>

          <SectionCard
            token={token}
            icon={<ClockCircleOutlined style={{ fontSize: 16, color: token.colorPrimary }} />}
            title="Default Session Settings"
          >
            <MyRow gutter={[24, 16]}>
              <MyCol xs={24} sm={12} md={8}>
                <MyForm.Item name="gracePeriod" label="Grace period (min)">
                  <InputNumber min={0} style={{ width: "100%" }} />
                </MyForm.Item>
              </MyCol>
              <MyCol xs={24} sm={12} md={8}>
                <MyForm.Item name="loginWindow" label="Login window (min)">
                  <InputNumber min={0} style={{ width: "100%" }} />
                </MyForm.Item>
              </MyCol>
              <MyCol xs={24} sm={12} md={8}>
                <MyForm.Item name="maxLivenessAttempts" label="Max liveness attempts">
                  <InputNumber min={1} max={5} style={{ width: "100%" }} />
                </MyForm.Item>
              </MyCol>

              <MyCol xs={24} md={12}>
                <MyText style={{ fontSize: 13, display: "block", marginBottom: 8 }}>
                  Face match threshold
                </MyText>
                <Flex align="center" gap={12}>
                  <MyForm.Item name="faceMatchThreshold" noStyle>
                    <Slider min={80} max={99} style={{ flex: 1 }} />
                  </MyForm.Item>
                  <MyForm.Item shouldUpdate noStyle>
                    {() => (
                      <MyText strong style={{ fontSize: 13, minWidth: 32 }}>
                        {form.getFieldValue("faceMatchThreshold")}%
                      </MyText>
                    )}
                  </MyForm.Item>
                </Flex>
              </MyCol>

              <MyCol xs={24} sm={12} md={6}>
                <Flex justify="space-between" align="center" style={{ height: "100%" }}>
                  <MyText style={{ fontSize: 13 }}>Question randomisation</MyText>
                  <MyForm.Item name="questionRandomisation" valuePropName="checked" noStyle>
                    <Switch />
                  </MyForm.Item>
                </Flex>
              </MyCol>
              <MyCol xs={24} sm={12} md={6}>
                <Flex justify="space-between" align="center" style={{ height: "100%" }}>
                  <MyText style={{ fontSize: 13 }}>Option shuffle</MyText>
                  <MyForm.Item name="optionShuffle" valuePropName="checked" noStyle>
                    <Switch />
                  </MyForm.Item>
                </Flex>
              </MyCol>
            </MyRow>
          </SectionCard>

          <Flex justify="space-between" align="center" wrap="wrap" gap={12}>
            <MyText type="secondary" style={{ fontSize: 12.5 }}>
              These defaults apply to new sessions. Existing sessions are not affected.
            </MyText>
            <MyButtonPrimary icon={<SaveOutlined />} htmlType="submit">
              Save Changes
            </MyButtonPrimary>
          </Flex>
        </Flex>
      </MyForm>
    </Flex>
  );
}
