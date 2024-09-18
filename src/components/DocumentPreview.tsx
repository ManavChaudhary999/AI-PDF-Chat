"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import byteSize from "byte-size";
import { DownloadCloud, Trash2Icon } from "lucide-react";
import { Button } from "./ui/button";
import useSubscription from "@/hooks/useSubscription";
import { deleteDocument } from "@/actions/deleteDocument";

export default function DocumentPreview({
    id,
    name,
    downloadUrl,
    size,
    createdAt
}: {
    id: string;
    name: string;
    size: number;
    downloadUrl: string;
    createdAt: string;
}) {
    const router = useRouter();
    const [isDeleting, startTransition] = useTransition();
    const { hasActiveMembership } = useSubscription();

    return (
        <div className="flex flex-col w-64 h-80 rounded-xl bg-white drop-shadow-md justify-between p-4 transition-all transform hover:scale-105 hover:bg-indigo-600 hover:text-white cursor-pointer group">
            <div
                className="flex-1"
                onClick={() => {
                    router.push(`/dashboard/files/${id}`);
                }}
            >
                <p className="font-semibold line-clamp-2">{name}</p>
                <p className="text-sm text-gray-500 group-hover:text-indigo-100">
                    {byteSize(size).value} KB
                    <br />
                    {createdAt.toString()}
                </p>
            </div>
            {/* Actions */}
            <div className="flex space-x-2 justify-end">
                <Button
                    variant="outline"
                    disabled={isDeleting || !hasActiveMembership}
                    onClick={() => {
                        const prompt = window.confirm(
                        "Are you sure you want to delete this document?"
                        );
                        if (prompt) {
                        // delete document
                        startTransition(async () => {
                            await deleteDocument(id);
                        });
                        }
                    }}
                >
                    <Trash2Icon className="h-6 w-6 text-red-500" />
                    {!hasActiveMembership && (
                        <span className="text-red-500 ml-2">PRO Feature</span>
                    )}
                </Button>

                <Button variant="default" className="text-white bg-indigo-600" asChild>
                    <a href={downloadUrl} download target="_blank">
                        <DownloadCloud className="h-6 w-6" />
                    </a>
                </Button>
            </div>
        </div>
    );
}