import { getServerSession } from "next-auth";
import { authOptions } from "../../lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "../../lib/prisma";
import IdeaClientBoard from "./IdeaClientBoard";

export const dynamic = "force-dynamic";

export default async function ComplaintsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const ideas = await prisma.sustainabilityIdea.findMany({
    orderBy: { createdAt: "desc" },
    include: { author: { select: { name: true, email: true, role: true } } },
  });

  return <IdeaClientBoard initialIdeas={ideas} session={session} />;
}
