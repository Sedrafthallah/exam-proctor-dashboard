import { useEffect, useState } from "react";
import { Checkbox, Segmented, Alert, Flex, theme } from "antd";
import { LockOutlined, SafetyOutlined } from "@ant-design/icons";

import MyCard from "../../MyComponents/myCard/MyCard";
import MyTitle from "../../MyComponents/MyTitle/MyTitle";
import MyText from "../../MyComponents/myText/MyText";
import MyButtonPrimary from "../../MyComponents/myButton/MyButtonPrimary";

import useRolesStore from "../../store/useRolesStore";
import { PERMISSION_CATEGORIES } from "../../MyComponents/usersTable/adminsData";

// Selectable pool for the Proctor role — an admin can check/uncheck any
// subset of these, not an all-or-nothing set.
const PROCTOR_ALLOWED_PERMISSIONS = [
  "MonitorExamSession",
  "ViewExamSession",
  "ViewStudents",
  "ViewAlerts",
  "DismissAlert",
  "WarnStudent",
  "EscalateAlert",
];

// User/role administration is a Super Admin-only capability — hidden from
// every other role's editor so Admin (and Proctor) can never be granted it.
const SUPER_ADMIN_ONLY_CATEGORIES = ["Users", "Roles & Permissions"];

export default function Roles() {
  const { token } = theme.useToken();

  const roles = useRolesStore((state) => state.roles);
  const updateRolePermission = useRolesStore((state) => state.updateRolePermission);
  const saveRole = useRolesStore((state) => state.saveRole);
  const fetchRoles = useRolesStore((state) => state.fetchRoles);
  const fetchPermissionCatalog = useRolesStore((state) => state.fetchPermissionCatalog);

  useEffect(() => {
    fetchRoles();
    fetchPermissionCatalog();
  }, []);

  const [selectedRoleId, setSelectedRoleId] = useState(null);

  // Adjust selectedRoleId during render (rather than in a useEffect) so the
  // fix-up happens before paint instead of triggering an extra render pass.
  const [syncedRoles, setSyncedRoles] = useState(roles);
  if (roles !== syncedRoles) {
    setSyncedRoles(roles);
    const stillExists = roles.some((r) => r.id === selectedRoleId);
    if (!stillExists && roles.length > 0) {
      setSelectedRoleId(roles[0].id);
    }
  }

  const selectedRole = roles.find((role) => role.id === selectedRoleId) || roles[0];

  const handleSave = () => saveRole(selectedRole.id);

  const isProctorRole = selectedRole?.name === "Proctor";

  const visibleCategories = PERMISSION_CATEGORIES.filter(
    (group) => selectedRole?.isFixed || !SUPER_ADMIN_ONLY_CATEGORIES.includes(group.category),
  )
    .map((group) => ({
      ...group,
      permissions: isProctorRole
        ? group.permissions.filter((p) => PROCTOR_ALLOWED_PERMISSIONS.includes(p.key))
        : group.permissions,
    }))
    .filter((group) => group.permissions.length > 0);

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

      <Flex vertical gap={20}>
        {visibleCategories.map((group) => (
          <Flex key={group.category} vertical gap={10}>
            <MyText type="secondary" style={{ fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.4 }}>
              {group.category}
            </MyText>

            <Flex vertical gap={12}>
              {group.permissions.map(({ key, label }) => (
                <MyCard key={key} style={{ padding: "14px 18px" }}>
                  <Flex align="center" gap={14}>
                    <Checkbox
                      checked={selectedRole?.permissions.includes(key)}
                      disabled={selectedRole?.isFixed}
                      onChange={(e) =>
                        updateRolePermission(selectedRole.id, key, e.target.checked)
                      }
                    />
                    <MyText strong>{label}</MyText>
                  </Flex>
                </MyCard>
              ))}
            </Flex>
          </Flex>
        ))}
      </Flex>
    </Flex>
  );
}
