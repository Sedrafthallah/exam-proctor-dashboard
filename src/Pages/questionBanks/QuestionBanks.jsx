import { useState, useEffect } from "react";
import { theme, Flex, Tag, Button } from "antd";
import { UploadOutlined, ArrowLeftOutlined, BookOutlined } from "@ant-design/icons";

import useAuthStore from "../../store/useAuthStore";
import useQuestionBankStore from "../../store/useQuestionBankStore";
import { getBankStatus, getStatusConfig } from "../../utils/questionBankUtils";

import MyTitle from "../../MyComponents/MyTitle/MyTitle";
import MyText from "../../MyComponents/myText/MyText";
import MyButtonPrimary from "../../MyComponents/myButton/MyButtonPrimary";

import BanksList from "../../MyComponents/questionBanksTable/BanksList";
import QuestionsPanel from "../../MyComponents/questionBanksTable/QuestionsPanel";
import UploadBankModal from "../../MyComponents/questionBanksTable/UploadBankModal";

export default function QuestionBanks() {
  const { token } = theme.useToken();
  const [selectedBankId, setSelectedBankId] = useState(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const currentUser = useAuthStore((state) => state.user);
  const isSuperAdmin = currentUser?.role === "SUPER_ADMIN";
  const canAuthor = isSuperAdmin || currentUser?.permissions?.P01 === true;

  const questionBanks = useQuestionBankStore((state) => state.questionBanks);
  const fetchQuestionBanks = useQuestionBankStore((state) => state.fetchQuestionBanks);
  const uploadQuestionBankApi = useQuestionBankStore((state) => state.uploadQuestionBankApi);
  const uploading = useQuestionBankStore((state) => state.uploading);
  const fetchQuestionBankById = useQuestionBankStore((state) => state.fetchQuestionBankById);
  const selectedBankDetail = useQuestionBankStore((state) => state.selectedBankDetail);
  const detailLoading = useQuestionBankStore((state) => state.detailLoading);

  useEffect(() => {
    fetchQuestionBanks();
  }, []);

  // summary from the list — shown immediately in the detail header while the
  // full question set (selectedBankDetail) is still loading
  const selectedBankSummary = questionBanks.find((b) => b.id === selectedBankId) ?? null;

  const handleSelectBank = async (bankId) => {
    setSelectedBankId(bankId);
    await fetchQuestionBankById(bankId);
  };

  const handleUploadBank = async (file, fields) => {
    const success = await uploadQuestionBankApi(file, fields);
    if (success) setIsUploadModalOpen(false);
    return success;
  };

  const uploadModal = canAuthor && (
    <UploadBankModal
      open={isUploadModalOpen}
      onClose={() => setIsUploadModalOpen(false)}
      onUpload={handleUploadBank}
      uploading={uploading}
    />
  );

  if (!selectedBankId) {
    return (
      <Flex vertical gap={20}>
        <Flex justify="space-between" align="center" wrap="wrap" gap={12}>
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
              <BookOutlined style={{ fontSize: 20, color: "#fff" }} />
            </Flex>
            <Flex vertical gap={2}>
              <MyTitle level={3} style={{ margin: 0, color: token.colorText }}>
                Question Banks
              </MyTitle>
              <MyText type="secondary">Author and manage question banks for exam sessions.</MyText>
            </Flex>
          </Flex>

          {canAuthor && (
            <MyButtonPrimary icon={<UploadOutlined />} onClick={() => setIsUploadModalOpen(true)}>
              Upload File
            </MyButtonPrimary>
          )}
        </Flex>

        <BanksList
          questionBanks={questionBanks}
          onSelectBank={handleSelectBank}
          canAuthor={canAuthor}
        />

        {uploadModal}
      </Flex>
    );
  }

  const { color, label } = getStatusConfig(
    selectedBankSummary ? getBankStatus(selectedBankSummary) : "",
  );

  return (
    <Flex vertical gap={20}>
      <Flex align="center" gap={12} wrap="wrap">
        <Button icon={<ArrowLeftOutlined />} onClick={() => setSelectedBankId(null)}>
          Back
        </Button>
        <MyTitle level={3} style={{ margin: 0, color: token.colorText }}>
          {selectedBankSummary?.code ?? ""}
        </MyTitle>
        <Tag color={color} style={{ margin: 0 }}>
          {label}
        </Tag>
      </Flex>

      <QuestionsPanel bank={selectedBankDetail} loading={detailLoading} />

      {uploadModal}
    </Flex>
  );
}
