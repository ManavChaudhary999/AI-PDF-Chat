'use server'

import { auth } from "@clerk/nextjs/server";
import { adminDb } from "@/lib/firebase/firebaseAdmin";

export async function deleteDocument(docId: string) {
    const { userId } = await auth();
    
    if (!userId) {
        throw new Error("User not found");
    }

    await adminDb
    .collection("users")
    .doc(userId)
    .collection("files")
    .doc(docId)
    .delete();
}