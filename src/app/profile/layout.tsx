import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const sessionData = await getSession();

  if (!sessionData) {
    redirect("/login");
  }

  // Admin không dùng trang cá nhân của khách hàng
  if (sessionData.user.role === "ADMIN") {
    redirect("/admin");
  }

  return <>{children}</>;
}
