'use server'
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { generateEmbeddingsInPineconeVectorStore } from "@/lib/langchain";


export async function generateEmbeddings(docId: string) {
    auth().protect(); // Protect Route with Clerk
    
    await generateEmbeddingsInPineconeVectorStore(docId);

    revalidatePath(`/dashboard`);
    return {completed: true};
}