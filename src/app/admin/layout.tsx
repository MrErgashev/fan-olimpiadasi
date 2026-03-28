import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { Sidebar } from "@/components/admin/Sidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  // Admin login sahifasini chiqarish (layout qo'llanmaydi)
  // Login sahifasi alohida route group da

  if (
    !session ||
    !["admin", "superadmin", "moderator"].includes(session.user.role || "")
  ) {
    redirect("/admin/login");
  }

  return (
    <div className="min-h-screen bg-green-900">
      <Sidebar />
      <main className="lg:ml-60 min-h-screen p-4 sm:p-6 lg:p-8 pt-16 lg:pt-8">
        {children}
      </main>
    </div>
  );
}
