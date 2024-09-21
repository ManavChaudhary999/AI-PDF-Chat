export const FREE_FILE_UPLOAD_LIMIT = 3;
export const PRO_FILE_UPLOAD_LIMIT = 20;
export const FREE_QUESTIONS_LIMIT = 3;
export const PRO_QUESTIONS_LIMIT = 100;
export const PRO_PRICE = 5.99;

export type MessageType = {
    id?: string;
    role: "human" | "ai" | "placeholder";
    message: string;
    createdAt: Date;
}

export type UserCheckoutDetailsType = {
    email: string;
    name: string;
}