'use client'

import { FormEvent, useEffect, useRef, useState, useTransition } from "react";
import { useUser } from "@clerk/nextjs";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Loader2Icon } from "lucide-react";
import { useCollection } from "react-firebase-hooks/firestore";
import { collection, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase/firebase";
import { askQuestion } from "@/actions/askQuestion";
import { v4 as randomUUID } from "uuid";
import ChatMessage from "./ChatMessage";
// import { useToast } from "./ui/use-toast";

export type Message = {
    id?: string;
    role: "human" | "ai" | "placeholder";
    message: string;
    createdAt: Date;
}

export default function PDFChat({docId} : { docId: string }) {
    const { user } = useUser();

    const [input, setInput] = useState<string>("");
    const [messages, setMessages] = useState<Message[]>([]);
    const [isPending, startTransition] = useTransition();
    const bottomOfChatRef = useRef<HTMLDivElement>(null);

    const [snapshot, loading] = useCollection(
        user && query(
            collection(db, "users", user.id, "files", docId, "messages"),
            orderBy("createdAt", "asc")
        )
    );

    useEffect(() => {
        if(!snapshot) return;

        // Get the second last message to check if it is a AI is thinking
        // It will only be possible if AI returns response for our query and
        // the last message will be the response set in askquestion action function.
        const lastMessage = messages.pop();

        if(lastMessage?.role === "ai" && lastMessage?.message === "Thinking...") {
            // simple return as this is a dummy placeholder message and we
            // we don't have a new response or messages.
            return;
        }

        const newMessages = snapshot.docs.map((doc) => {
            const { role, message, createdAt, } = doc.data();

            return {
                id: doc.id,
                role,
                message,
                createdAt
            }
        });

        setMessages(newMessages);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [snapshot]);

    useEffect(() => {
        if(bottomOfChatRef.current) {
            bottomOfChatRef.current.scrollIntoView({
                behavior: "smooth",
            });
        }
    }, [messages]);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!input) return;

        const prevInput = input
        setInput("");

        setMessages((prev) => [
            ...prev,
            {
                id: randomUUID(),
                role: "human",
                message: prevInput,
                createdAt: new Date()
            },
            {
                id: randomUUID(),
                role: "ai",
                message: "Thinking...",
                createdAt: new Date()
            }
        ]);

        startTransition(async () => {
            const { success, message } = await askQuestion(docId, prevInput); // Server Action

            if (!success) {
                setMessages((prev) =>
                    // TODO: Toast element

                    // We want to remove the last message element, which is the "Thinking..." message
                    // and replace it with the error message
                    prev.slice(0, prev.length - 1).concat([
                        {
                            id: randomUUID(),
                            role: "ai",
                            message: `Whoops, something went wrong: ${message}`,
                            createdAt: new Date(),
                        }
                    ]),
                );
            }
        });
    }
    
    return (
        <div className="flex flex-col h-full overflow-auto">
            {/* Chat contents */}
            <div className="flex-1 w-full">
                {loading ? (
                <div className="flex items-center justify-center">
                    <Loader2Icon className="animate-spin h-20 w-20 text-indigo-600 mt-20" />
                </div>
                ) : (
                <div className="p-5">
                    {messages.length === 0 && (
                        <ChatMessage
                            key={"placeholder"}
                            message={{
                                id: randomUUID(),
                                role: "ai",
                                message: "Ask me anything about the document!",
                                createdAt: new Date(),
                            }}
                        />
                    )}

                    {messages?.map((message) => (
                        <ChatMessage key={message.id || randomUUID()} message={message} />
                    ))}

                    <div ref={bottomOfChatRef} />
                </div>
                )}
            </div> 

            <form
                className="flex sticky bottom-0 space-x-2 p-5 bg-indigo-600/75"
                onSubmit={handleSubmit}
            >
                <Input
                    placeholder="Ask a Question..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                />

                <Button type="submit" disabled={!input || isPending}>
                {isPending ? (
                    <Loader2Icon className="animate-spin text-indigo-600" />
                ) : (
                    "Ask"
                )}
                </Button>
            </form>
        </div>
    )
}