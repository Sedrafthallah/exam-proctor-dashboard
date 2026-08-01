import { useEffect, useState } from "react";
import { Checkbox, Segmented, Alert, Flex, theme } from "antd";
import { LockOutlined, SafetyOutlined } from "@ant-design/icons";

import MyCard from "../../MyComponents/myCard/MyCard";
import MyTitle from "../../MyComponents/MyTitle/MyTitle";
import MyText from "../../MyComponents/myText/MyText";
import MyButtonPrimary from "../../MyComponents/myButton/MyButtonPrimary";

import useRolesStore, { PERMISSION_LABELS } from "../../store/useRolesStore";

export default function Roles() {
  const { token } = theme.useToken();

  const roles = useRolesStore((state) => state.roles);
  const updateRolePermission = useRolesStore((state) => state.updateRolePermission);
  const saveRole = useRolesStore((state) => state.saveRole);
  const fetchRoles = useRolesStore((state) => state.fetchRoles);

  useEffect(() => {
    fetchRoles();
  }, []);

  const [selectedRoleId, setSelectedRoleId] = useState(roles[0]?.id);

  const selectedRole = roles.find((role) => role.id === selectedRoleId) || roles[0];

  const handleSave = () => saveRole(selectedRole.id);

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
            <SafetyOutlined style={{ fontSize: 20, color: "#fff" }} />
          </Flex>
          <div>
            <MyTitle level={3} style={{ margin: 0, color: token.colorText }}>
              Roles & Permissions Management
            </MyTitle>
            <MyText type="secondary">Define what each role can access.</MyText>
          </div>
        </Flex>
        {!selectedRole?.isFixed && (
          <MyButtonPrimary onClick={handleSave}>Save Changes</MyButtonPrimary>
        )}
      </Flex>

      <Segmented
        options={roles.map((r) => ({
          label: r.name,
          value: r.id,
        }))}
        value={selectedRoleId}
        onChange={setSelectedRoleId}
        size="large"
      />

      {selectedRole?.isFixed && (
        <Alert
          type="warning"
          showIcon
          icon={<LockOutlined />}
          message="Super Admin has all permissions by default. This role cannot be edited."
        />
      )}

      <Flex vertical gap={12}>
        {Object.entries(PERMISSION_LABELS).map(([permId, { label, desc }]) => (
          <MyCard key={permId} style={{ padding: "14px 18px" }}>
            <Flex align="center" gap={14}>
              <Checkbox
                checked={selectedRole?.permissions[permId]}
                disabled={selectedRole?.isFixed}
                onChange={(e) =>
                  updateRolePermission(selectedRole.id, permId, e.target.checked)
                }
              />
              <Flex vertical gap={2}>
                <MyText strong>
                  {permId} — {label}
                </MyText>
                <MyText type="secondary" style={{ fontSize: 12 }}>
                  {desc}
                </MyText>
              </Flex>
            </Flex>
          </MyCard>
        ))}
      </Flex>
    </Flex>
  );
}
