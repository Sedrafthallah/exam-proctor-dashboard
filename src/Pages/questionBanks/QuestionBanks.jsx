import { useState } from "react";
import { theme, Flex, Tag, Button } from "antd";
import { UploadOutlined, ArrowLeftOutlined } from "@ant-design/icons";

import useAuthStore from "../../store/useAuthStore";
import useQuestionBankStore from "../../store/useQuestionBankStore";
import { getBankStatus, getStatusConfig } from "../../utils/questionBankUtils";

import MyTitle from "../../MyComponents/MyTitle/MyTitle";
import MyButtonPrimary from "../../MyComponents/myButton/MyButtonPrimary";

import BanksList from "../../MyComponents/questionBanksTable/BanksList";
import QuestionsPanel from "../../MyComponents/questionBanksTable/QuestionsPanel";
import UploadBankModal from "../../MyComponents/questionBanksTable/UploadBankModal";

export default function QuestionBanks() {
  const { token } = theme.useToken();
  const [selectedBankCode, setSelectedBankCode] = useState(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const currentUser = useAuthStore((state) => state.user);
  const isSuperAdmin = currentUser?.role === "SUPER_ADMIN";
  const canAuthor = isSuperAdmin || currentUser?.permissions?.P01 === true;

  const questionBanks = useQuestionBankStore((state) => state.questionBanks);
  const createBankFromCsv = useQuestionBankStore((state) => state.createBankFromCsv);

  const selectedBank = questionBanks.find((b) => b.code === selectedBankCode) ?? null;

  const handleUploadBank = ({ questions, ...values }) => {
    const bank = createBankFromCsv(questions, values);
    setSelectedBankCode(bank.code);
    setIsUploadModalOpen(false);
    return bank;
  };

  const uploadModal = canAuthor && (
    <UploadBankModal
      open={isUploadModalOpen}
      onClose={() => setIsUploadModalOpen(false)}
      onCreate={handleUploadBank}
    />
  );

  if (!selectedBank) {
    return (
      <Flex vertical gap={20}>
        <Flex justify="space-between" align="center" wrap="wrap" gap={12}>
          <MyTitle level={3} style={{ margin: 0, color: token.colorText }}>
            Question Banks
          </MyTitle>

          {canAuthor && (
            <MyButtonPrimary icon={<UploadOutlined />} onClick={() => setIsUploadModalOpen(true)}>
              Upload File
            </MyButtonPrimary>
          )}
        </Flex>

        <BanksList
          questionBanks={questionBanks}
          onSelectBank={setSelectedBankCode}
          canAuthor={canAuthor}
        />

        {uploadModal}
      </Flex>
    );
  }

  const { color, label } = getStatusConfig(getBankStatus(selectedBank));

  return (
    <Flex vertical gap={20}>
      <Flex align="center" gap={12} wrap="wrap">
        <Button icon={<ArrowLeftOutlined />} onClick={() => setSelectedBankCode(null)}>
          Back
        </Button>
        <MyTitle level={3} style={{ margin: 0, color: token.colorText }}>
          {selectedBank.code}
        </MyTitle>
        <Tag color={color} style={{ margin: 0 }}>
          {label}
        </Tag>
      </Flex>

      <QuestionsPanel bank={selectedBank} />

      {uploadModal}
    </Flex>
  );
}
