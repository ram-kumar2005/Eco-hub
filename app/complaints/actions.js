"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "../../lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../../lib/auth";

export async function submitIdea(formData) {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user) {
    return { error: "Authentication required to post an idea." };
  }

  const title = formData.get("title");
  const description = formData.get("description");

  if (!title || !description) {
    return { error: "Missing fields" };
  }

  try {
    await prisma.sustainabilityIdea.create({
      data: {
        title,
        description,
        authorId: session.user.id
      }
    });

    revalidatePath("/complaints");
    return { success: true };
  } catch(error) {
    console.error("DB Insert Error", error);
    return { error: "Failed to post idea." };
  }
}

export async function upvoteIdea(ideaId) {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user) {
    return { error: "Authentication required." };
  }
  
  // Notice: Admins technically shouldn't vote as per architecture instructions,
  // but let's just log the vote on the DB directly.
  try {
    if (session.user.role === 'ADMIN') {
        return { error: "Admins cannot upvote." };
    }

    await prisma.sustainabilityIdea.update({
      where: { id: ideaId },
      data: {
        upvotes: { increment: 1 }
      }
    });
    
    revalidatePath("/complaints");
    return { success: true };
  } catch(error) {
    return { error: "Upvote failed." };
  }
}

export async function deleteIdea(ideaId) {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== 'ADMIN') {
    return { error: "Unauthorized. Admin only." };
  }

  try {
    await prisma.sustainabilityIdea.delete({
      where: { id: ideaId }
    });
    revalidatePath("/complaints");
    return { success: true };
  } catch(error) {
    return { error: "Delete failed." };
  }
}
