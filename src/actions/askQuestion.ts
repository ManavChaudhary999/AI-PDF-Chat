'use server'

import { auth } from "@clerk/nextjs/server";
import { adminDb } from "@/lib/firebase/firebaseAdmin";
import { generateLangchainCompletion } from "@/lib/langchain";
import { MessageType, FREE_QUESTIONS_LIMIT, PRO_QUESTIONS_LIMIT } from "@/config";

export async function askQuestion(docId: string, question: string) {
    auth().protect(); // Protect Route with Clerk

    const { userId } = auth();

    try {
        const chatRef = await adminDb
        .collection("users")
        .doc(userId!)
        .collection("files")
        .doc(docId)
        .collection("messages");
    
        // Check how many user messages are in the chat
        const chatSnapshot = await chatRef.get();
        const userMessages = chatSnapshot.docs.filter(doc => doc.data().role === "human");
    
        // Check if user has reached free limit or pro limit
        const userRef = await adminDb.collection("users").doc(userId!).get();
        if(userMessages.length >= FREE_QUESTIONS_LIMIT && !userRef.data()?.hasActiveMembership) {
            return {
                success: false,
                type: "FREE",
                message: "You have reached the free limit. Please upgrade to Pro to use more features."
            };        
        }
    
        if(userMessages.length >= PRO_QUESTIONS_LIMIT && userRef.data()?.hasActiveMembership) {
            return {
                success: false,
                type: "PRO",
                message: "You have reached the Pro limit. Sorry, you can't ask more questions."
            };        
        }
    
        // Add user message to chat
        const userMessage:MessageType = {
            role: "human",
            message: question,
            createdAt: new Date(),
        }
        await chatRef.add(userMessage);
    
        // Generate AI response and add it to chat
        const response = await generateLangchainCompletion(docId, question);
    
        const aiMessage:MessageType = {
            role: "ai",
            message: response,
            createdAt: new Date(),
        }
        await chatRef.add(aiMessage);
    
        return {success: true, type: null, message: null};
    }
    catch (error) {
        console.error(error);

        return {
            success: false,
            type: null,
            message: "Something went wrong. Please try again later."
        }
    }
}