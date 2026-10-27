import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const sessionData = await getSession();

  if (!sessionData) {
    redirect("/login");
  }

  if (sessionData.user.role === "ADMIN") {
    redirect("/admin");
  }

  return <>{children}</>;
}
