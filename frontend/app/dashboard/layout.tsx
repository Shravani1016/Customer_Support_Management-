import RoleLayout from "@/components/layout/RoleLayout";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleLayout role={["sales_rep", "manager"]}>
      {children}
    </RoleLayout>
  );
}