import { useEffect, useRef } from "react";
import { theme, Flex, Tag, Button } from "antd";
import MyModal from "../myModal/MyModal";
import MyText from "../myText/MyText";
import MyTitle from "../MyTitle/MyTitle";

const PEER_TAG = {
  connecting: { color: "processing", label: "Connecting" },
  live: { color: "success", label: "Live" },
  failed: { color: "error", label: "Failed" },
};

export default function WatchStreamModal({
  open,
  studentName,
  studentNumber,
  peerState = "connecting",
  remoteStream,
  onEnd,
}) {
  const { token } = theme.useToken();
  const videoRef = useRef(null);
  const tag = PEER_TAG[peerState] ?? PEER_TAG.connecting;

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    if (remoteStream) {
      el.srcObject = remoteStream;
      void el.play().catch(() => {
        /* autoplay may require muted — already muted */
      });
    } else {
      el.srcObject = null;
    }
  }, [remoteStream]);

  return (
    <MyModal
      open={open}
      onCancel={onEnd}
      destroyOnHidden
      width={880}
      title={null}
    >
      <Flex vertical gap={0} style={{ background: token.colorBgElevated }}>
        <Flex
          justify="space-between"
          align="center"
          style={{
            padding: "14px 18px",
            borderBottom: `1px solid ${token.colorBorderSecondary}`,
          }}
        >
          <Flex vertical gap={2}>
            <MyTitle level={5} style={{ margin: 0 }}>
              {studentName ?? "Student"}
            </MyTitle>
            <MyText type="secondary" style={{ fontSize: 12 }}>
              {studentNumber ? `${studentNumber} · ` : ""}
              Live watch
            </MyText>
          </Flex>
          <Flex align="center" gap={10}>
            <Tag color={tag.color} style={{ margin: 0, fontWeight: 600 }}>
              {tag.label}
            </Tag>
            <Button danger onClick={onEnd}>
              End watch
            </Button>
          </Flex>
        </Flex>

        <div
          style={{
            position: "relative",
            width: "100%",
            background: "#0b1020",
            aspectRatio: "16 / 10",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
              background: "#0b1020",
            }}
          />
          {!remoteStream && (
            <MyText
              style={{
                position: "absolute",
                color: "rgba(255,255,255,0.65)",
                fontSize: 13,
              }}
            >
              Waiting for student video…
            </MyText>
          )}
        </div>
      </Flex>
    </MyModal>
  );
}
