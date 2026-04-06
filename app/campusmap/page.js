import { getServerSession } from "next-auth";
import { authOptions } from "../../lib/auth";
import { redirect } from "next/navigation";
import Sidebar from "../../components/Sidebar";
import CampusMapClient from "./CampusMapClient";

export const dynamic = "force-dynamic";

export default async function CampusMapPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  return (
    <div className="app-shell">
      <Sidebar user={session.user} />
      <CampusMapClient />
    </div>
  );
}
