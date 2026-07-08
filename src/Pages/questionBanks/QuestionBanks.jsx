import { useState } from "react";
import { theme, Select, Flex, Tag } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

import useAuthStore from "../../store/useAuthStore";
import useSessionStore from "../../store/useSessionStore";
import useQuestionBankStore from "../../store/useQuestionBankStore";
import { getBankStatus, getStatusConfig } from "../../utils/questionBankUtils";

import MyTitle from "../../MyComponents/MyTitle/MyTitle";
import MyText from "../../MyComponents/myText/MyText";
import MyButtonPrimary from "../../MyComponents/myButton/MyButtonPrimary";

import QuestionsPanel from "../../MyComponents/questionBanksTable/QuestionsPanel";
import UploadBankModal from "../../MyComponents/questionBanksTable/UploadBankModal";

export default function QuestionBanks() {
  const { token } = theme.useToken();
  const [activeBankCode, setActiveBankCode] = useState(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const currentUser = useAuthStore((state) => state.user);
  const isSuperAdmin = currentUser?.role === "SUPER_ADMIN";
  const canAuthor = isSuperAdmin || currentUser?.permissions?.P01 === true;

  const sessions = useSessionStore((state) => state.sessions);
  const questionBanks = useQuestionBankStore((state) => state.questionBanks);
  const createBankFromCsv = useQuestionBankStore((state) => state.createBankFromCsv);

  const activeBank = questionBanks.find((b) => b.code === activeBankCode) || questionBanks[0] || null;
  const status = activeBank ? getBankStatus(activeBank) : null;
  const linkedSession = activeBank?.linkedSessionId
    ? sessions.find((s) => s.id === activeBank.linkedSessionId)
    : null;

  const bankOptions = questionBanks.map((bank) => ({
    value: bank.code,
    label: `${bank.code} · v${bank.version}`,
  }));

  const handleUploadBank = ({ questions, ...values }) => {
    const bank = createBankFromCsv(questions, values);
    setActiveBankCode(bank.code);
    setIsUploadModalOpen(false);
    return bank;
  };

  return (
    <Flex vertical gap={20}>
      <Flex justify="space-between" align="flex-start" wrap="wrap" gap={12}>
        <Flex vertical gap={10}>
          <MyTitle level={3} style={{ margin: 0, color: token.colorText }}>
            Question Banks
          </MyTitle>

          {activeBank && (
            <Flex align="center" gap={10} wrap="wrap">
              <MyText type="secondary" style={{ fontSize: 13 }}>
                Active bank:
              </MyText>
              <Select
                value={activeBank.code}
                options={bankOptions}
                onChange={setActiveBankCode}
                style={{ minWidth: 200 }}
              />
              {status && (
                <Tag color={getStatusConfig(status).color} style={{ margin: 0 }}>
                  {getStatusConfig(status).label}
                </Tag>
              )}
              {linkedSession && (
                <Tag style={{ margin: 0 }}>
                  Session: {linkedSession.sessionTitle} ·{" "}
                  {dayjs(linkedSession.scheduledStartUTC).format("YYYY-MM-DD HH:mm")}
                </Tag>
              )}
            </Flex>
          )}
        </Flex>

        {canAuthor && (
          <MyButtonPrimary icon={<UploadOutlined />} onClick={() => setIsUploadModalOpen(true)}>
            Upload File
          </MyButtonPrimary>
        )}
      </Flex>

      {activeBank ? (
        <QuestionsPanel bank={activeBank} />
      ) : (
        <Flex vertical align="center" gap={12} style={{ padding: "60px 0" }}>
          <MyText type="secondary">No question banks yet.</MyText>
          {canAuthor && (
            <MyButtonPrimary icon={<UploadOutlined />} onClick={() => setIsUploadModalOpen(true)}>
              Upload File
            </MyButtonPrimary>
          )}
        </Flex>
      )}

      {canAuthor && (
        <UploadBankModal
          open={isUploadModalOpen}
          onClose={() => setIsUploadModalOpen(false)}
          onCreate={handleUploadBank}
        />
      )}
    </Flex>
  );
}
