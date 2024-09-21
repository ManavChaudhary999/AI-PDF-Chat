'use client'

import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { FREE_FILE_UPLOAD_LIMIT, PRO_FILE_UPLOAD_LIMIT } from "@/config";
import { useCollection, useDocument } from "react-firebase-hooks/firestore";
import { collection, doc } from "firebase/firestore";
import { db } from "@/lib/firebase/firebase";


export default function useSubscription() {
    const [hasActiveMembership, setHasActiveMembership] = useState(null);
    const [isOverFileLimit, setIsOverFileLimit] = useState(false);

    const { user } = useUser();

    const [snapShots, loading, error] = useDocument(
        user && doc(db, "users", user.id),
        {
            snapshotListenOptions: { includeMetadataChanges: true },
        }
    );

    const [filesSnapshots, filesLoading] = useCollection(
        user && collection(db, "users", user.id, "files"),
    );

    useEffect(() => {
        if(!snapShots) return;

        const data = snapShots.data();
        if(!data) return;

        setHasActiveMembership(data.hasActiveMembership);

    }, [snapShots]);

    useEffect(() => {
        if(!filesSnapshots || hasActiveMembership == null) return;
        
        const data = filesSnapshots.docs;
        if(!data) return;

        const userLimit = hasActiveMembership ? PRO_FILE_UPLOAD_LIMIT : FREE_FILE_UPLOAD_LIMIT;

        setIsOverFileLimit(data.length >= userLimit);

    }, [filesSnapshots, hasActiveMembership]);

    return {
        hasActiveMembership,
        loading,
        error,
        isOverFileLimit,
        filesLoading
    };
}