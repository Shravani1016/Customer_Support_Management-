import RoleLayout from "@/components/layout/RoleLayout";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleLayout role="employee">
      {children}
    </RoleLayout>
  );
}