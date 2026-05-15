import { AdminNav } from "@/components/admin/AdminNav";
import { requireAdmin } from "@/lib/auth-helpers";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();
  return (
    <>
      <AdminNav email={admin.email} />
      {children}
    </>
  );
}
