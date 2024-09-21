'use client'

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { v4 as randomUUID } from "uuid";
import { db, storage } from "@/lib/firebase/firebase";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { doc, setDoc } from "firebase/firestore";
import { generateEmbeddings } from "@/actions/generateEmbeddings";

export enum StatusText {
    UPLOADING = "Uploading file...",
    UPLOADED = "File uploaded successfully...",
    SAVING = "Saving file to database...",
    GENERATING = "Generating AI Embeddings, this will only take a few seconds...",
}

export type Status = StatusText[keyof StatusText];

export default function useUpload() {
    const [progress, setProgress] = useState<number | null>(null);
    const [fileId, setFileId] = useState<string | null>(null);
    const [status, setStatus] = useState<Status | null>(null);

    const { user } = useUser();

    const handleUpload = async (file: File) => {
        if(!file || !user) return;

        // UPLOAD FILE TO CLOUD STORAGE
        const uploadedFileId = randomUUID();

        const storageRef = ref(storage, `users/${user.id}/files/${uploadedFileId}`);
        const uploadTask = uploadBytesResumable(storageRef, file); // Event Listener to track upload progress.
        
        uploadTask.on("state_changed", (snapshot) => { // When upload starts.
            const percentage = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
            setProgress(percentage);
            setStatus(StatusText.UPLOADING);

        }, (error) => { // When upload fails.
            console.error("Error Uploading File", error);
            
        }, async () => { // When upload is completed.
            setStatus(StatusText.UPLOADED);
            const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
            
            // Upload Meta data to firestore
            await setDoc(doc(db, "users", user.id, "files", uploadedFileId), {
                name: file.name,
                size: file.size,
                type: file.type,
                downloadUrl: downloadUrl,
                ref: uploadTask.snapshot.ref.fullPath,
                createdAt: new Date(),
            });

            setStatus(StatusText.GENERATING);
            await generateEmbeddings(uploadedFileId);

            setFileId(uploadedFileId); 
        });
    }

    return {
        progress,
        status,
        fileId,
        handleUpload
    };
}