import { redirect } from "next/navigation";
import { getSession } from "@/features/auth/server/session";

export default async function AuthLayout({ children }: LayoutProps<"/">) {
  if (await getSession()) redirect("/compte");
  return <main className="flex flex-1 flex-col items-center justify-center gap-6 px-4">{children}</main>;
}
