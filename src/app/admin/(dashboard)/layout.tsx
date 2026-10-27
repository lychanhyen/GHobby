import { Metadata } from "next";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";

export const metadata: Metadata = {
  title: "Quản Trị - GHobby",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const sessionData = await getSession();
  
  if (!sessionData) {
    redirect("/admin/login");
  }

  if (sessionData.user.mustChangePassword) {
    redirect("/admin/doi-mat-khau");
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminSidebar />
      <div className="lg:pl-64">
        <AdminHeader user={sessionData.user} />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
