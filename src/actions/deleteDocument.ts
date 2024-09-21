'use server'

import { auth } from "@clerk/nextjs/server";
import { adminDb, adminStorage } from "@/lib/firebase/firebaseAdmin";
import { indexName, namespaceExists } from "@/lib/langchain";
import pineconeClient from "@/lib/pinecone";
import { revalidatePath } from "next/cache";


export async function deleteDocument(docId: string) {
    auth().protect();

    const { userId } = await auth();

    try {
        // Delete the document from Firestore (metadata)
        await deleteUserDocument(userId!, docId);
    
        // Delete the document from Firebase Storage
        await adminStorage
        .bucket(process.env.FIREBASE_STORAGE_BUCKET)
        .file(`users/${userId}/files/${docId}`)
        .delete();
    
        // Delete the document from Pinecone if it exists
        const pineconeIndex = pineconeClient.Index(indexName);

        const namespaceAlreadyExists = await namespaceExists(pineconeIndex, docId);
        if (namespaceAlreadyExists) {
            await pineconeIndex.namespace(docId).deleteAll();
        }
    
        // Revalidate(referesh) the dashboard page to remove the deleted document from UI
        revalidatePath('/dashboard');
    } catch (error) {
        console.error(error);
    }
}


// Example: Delete a specific document for a specific user and its subcollections
const deleteUserDocument = async (userId: string, docId: string) => {
    const docRef = await adminDb.collection('users').doc(userId).collection('files').doc(docId);

    await deleteDocumentAndSubcollections(docRef);
};
  
// Function to  delete a document and its subcollection
async function deleteDocumentAndSubcollections(docRef: FirebaseFirestore.DocumentReference<FirebaseFirestore.DocumentData, FirebaseFirestore.DocumentData>) {
    const messageRef = await docRef.collection('messages');

    await deleteSubcollection(messageRef); // Delete message subcollection

    await docRef.delete(); // Delete the main document after subcollection is deleted
}

// Function to delete all documents in a subcollection (e.g., 'messages')
async function deleteSubcollection(collectionRef: FirebaseFirestore.CollectionReference<FirebaseFirestore.DocumentData, FirebaseFirestore.DocumentData>) {
    const messageSnapshot = await collectionRef.get();

    if (messageSnapshot.size === 0) {
        // No documents exist in the subcollection
        return;
    }

    messageSnapshot.docs.forEach((doc) => {
        doc.ref.delete(); // Delete each document
    });
}