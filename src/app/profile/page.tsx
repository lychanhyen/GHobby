import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import ProfileClient from "./ProfileClient";

export default async function ProfilePage() {
  const sessionData = await getSession();

  if (!sessionData) {
    redirect("/login");
  }

  // Admin không dùng trang cá nhân của khách hàng
  if (sessionData.user.role === "ADMIN") {
    redirect("/admin");
  }

  const { user } = sessionData;

  return (
    <ProfileClient
      initialProfile={{
        fullName: user.fullName || "",
        phone: user.phone || "",
        address: user.address || "",
        email: user.email || "",
      }}
    />
  );
}
