import RoleLayout from "@/components/layout/RoleLayout";

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <RoleLayout role="super_admin">{children}</RoleLayout>;
}