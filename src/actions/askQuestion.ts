'use server'

import { auth } from "@clerk/nextjs/server";
import { adminDb } from "@/lib/firebase/firebaseAdmin";
import { Message } from "@/components/PDFChat";
import { generateLangchainCompletion } from "@/lib/langchain";

// const FREE_LIMIT = 3;
// const PRO_LIMIT = 100;

export async function askQuestion(docId: string, question: string) {
    auth().protect(); // Protect Route with Clerk

    const { userId } = auth();

    const chatRef = await adminDb
    .collection("users")
    .doc(userId!)
    .collection("files")
    .doc(docId)
    .collection("messages");

    // Check how many user messages are in the chat
    // const chatSnapshot = await chatRef.get();
    // const userMessages = chatSnapshot.docs.filter(doc => doc.data().role === "human");

    // TODO: Add logic to check if user has reached free limit or pro limit

    // Add user message to chat
    const userMessage:Message = {
        role: "human",
        message: question,
        createdAt: new Date(),
    }
    await chatRef.add(userMessage);

    // Generate AI response and add it to chat
    const response = await generateLangchainCompletion(docId, question);

    const aiMessage:Message = {
        role: "ai",
        message: response,
        createdAt: new Date(),
    }
    await chatRef.add(aiMessage);

    return {success: true, message: "Hello World"};
}