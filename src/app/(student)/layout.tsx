import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { StudentNavbar } from "@/components/shared/StudentNavbar";

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "student" || !session.user.id) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <StudentNavbar
        firstName={session.user.firstName || ""}
        lastName={session.user.lastName || ""}
      />
      <main className="pt-20 pb-10">{children}</main>
    </div>
  );
}
