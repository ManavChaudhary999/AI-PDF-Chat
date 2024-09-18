import { ChatCohere, CohereEmbeddings } from "@langchain/cohere";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { createRetrievalChain } from "langchain/chains/retrieval";
import { createHistoryAwareRetriever } from "langchain/chains/history_aware_retriever";
import { HumanMessage, AIMessage } from "@langchain/core/messages";
import pineconeClient from "./pinecone";
import { PineconeStore } from "@langchain/pinecone";
// import { PineconeConflictError } from "@pinecone-database/pinecone/dist/errors";
import { Index, RecordMetadata } from "@pinecone-database/pinecone";
import { adminDb } from "./firebase/firebaseAdmin";
import { auth } from "@clerk/nextjs/server";


// Pinecone database index name
export const indexName = "quickstart";

const model = new ChatCohere({
  model: "command-r-plus",
  apiKey: process.env.COHERE_API_KEY,
  // temperature: 0,
  // maxRetries: 2,
  // other params...
});


// {
//     name: 'embed-multilingual-v3.0',
//     endpoints: [ 'embed', 'classify' ],
//     finetuned: false,
//     contextLength: 512,
//     tokenizerUrl: 'https://storage.googleapis.com/cohere-public/tokenizers/embed-multilingual-v3.0.json',
//     defaultEndpoints: [],
//     dimension: 1024,
//   }
//   {
//     name: 'embed-multilingual-v2.0',
//     endpoints: [ 'embed', 'classify' ],
//     finetuned: false,
//     contextLength: 256,
//     tokenizerUrl: 'https://storage.googleapis.com/cohere-public/tokenizers/embed-multilingual-v2.0.json',
//     defaultEndpoints: [],
//     dimension: 768,
//   }
//   {
//     name: 'embed-english-v2.0', // default model
//     endpoints: [ 'embed', 'classify' ],
//     finetuned: false,
//     contextLength: 512,
//     tokenizerUrl: undefined,
//     defaultEndpoints: [],
//     dimension: 4096,
//   }
//   {
//     name: 'embed-multilingual-light-v3.0',
//     endpoints: [ 'embed', 'classify' ],
//     finetuned: false,
//     contextLength: 512,
//     tokenizerUrl: 'https://storage.googleapis.com/cohere-public/tokenizers/embed-multilingual-light-v3.0.json',
//     defaultEndpoints: [],
//     dimension: 384,
//   }
//   {
//     name: 'embed-english-v3.0',
//     endpoints: [ 'embed', 'classify' ],
//     finetuned: false,
//     contextLength: 512,
//     tokenizerUrl: 'https://storage.googleapis.com/cohere-public/tokenizers/embed-english-v3.0.json',
//     defaultEndpoints: [],
//     dimension: 1024,
//   }
//   
//   {
//     name: 'embed-english-light-v2.0',
//     endpoints: [ 'embed', 'classify' ],
//     finetuned: false,
//     contextLength: 512,
//     tokenizerUrl: undefined,
//     defaultEndpoints: [],
//     dimension: 1024,
//   }
//   
//   {
//     name: 'embed-english-light-v3.0',
//     endpoints: [ 'embed', 'classify' ],
//     finetuned: false,
//     contextLength: 512,
//     tokenizerUrl: 'https://storage.googleapis.com/cohere-public/tokenizers/embed-english-light-v3.0.json',
//     defaultEndpoints: [],
//     dimension: 384,
//   }


// class CohereEmbeddings { // CohereEmbeddings class that implements EmbeddingsInterface
//     // Method to embed an array of documents
//     async embedDocuments(texts: string[]): Promise<number[][]> {
//         const response = await cohere.embed({
//             texts: texts,
//             model: 'embed-english-light-v2.0'
//         });
//         if (Array.isArray(response.embeddings)) {
//             return response.embeddings.map((embedding) => embedding as number[]);

//         } else {
//             throw new Error("Failed to generate embedding from Cohere model");
//         }
//     }

//     // Method to embed a single query (string)
//     async embedQuery(text: string): Promise<number[]> {
//         const response = await cohere.embed({
//             texts: [text],
//             model: 'embed-english-light-v2.0'
//         });
//         if (Array.isArray(response?.embeddings)) {
//             const embedding = response?.embeddings[0];
//             return embedding;
//         } else {
//                throw new Error("Failed to generate embedding from Cohere model");
//         }
//     }
// }

// Function to generate embeddings using Cohere API

async function namespaceExists(index: Index<RecordMetadata>, docId: string) {
    if(!docId) throw new Error("Missing namespace");

    const { namespaces } = await index.describeIndexStats();
    return namespaces?.[docId] !== undefined;
}

async function fetchMessagesFromDB(docId: string) {
    const { userId } = await auth();
    if (!userId) {
        throw new Error("User not found");
    }

    const messages = await adminDb
    .collection("users")
    .doc(userId)
    .collection("files")
    .doc(docId)
    .collection("messages")
    .orderBy("createdAt", "desc")
    // .limit(10) // Fetch the last 10 messages
    .get();

    const chatHistory = messages.docs.map((doc) => 
        doc.data().role === 'human' ? new HumanMessage(doc.data().message) : new AIMessage(doc.data().message)
    );

    console.log(`--- Fetched last ${chatHistory} message successfully ---`);

    return chatHistory;
}

export async function generateDocs(docId: string) {
    const { userId } = await auth();

    if (!userId) {
        throw new Error("User not found");
    }

    console.log("--- Fetching the download URL from Firebase... ---");

    const firebaseRef = await adminDb
        .collection("users")
        .doc(userId)
        .collection("files")
        .doc(docId)
        .get();

    const downloadUrl = firebaseRef.data()?.downloadUrl;

    if (!downloadUrl) {
        throw new Error("Download URL not found");
    }

    console.log(`--- Download URL fetched successfully: ${downloadUrl} ---`);

    // Fetch the PDF from the specified URL;
    const response = await fetch(downloadUrl);

    // Load the PDF into a PDFDocument object
    const data = await response.blob();

    // Load the PDF document from the specified path
    console.log("--- Loading PDF document... ---");
    const loader = new PDFLoader(data);
    const docs = await loader.load();

    // Split the loaded document into smaller parts for easier processing
    console.log("--- Splitting the document into smaller parts... ---");
    const splitter = new RecursiveCharacterTextSplitter();

    const splitDocs = await splitter.splitDocuments(docs);
    console.log(`--- Split into ${splitDocs.length} parts ---`);

    return splitDocs;
}

export async function generateEmbeddingsInPineconeVectorStore(docId: string) {
    const { userId } = await auth();
    if (!userId) {
        throw new Error("User not found");
    }

    let pineconeVectorStore;
    
    // Generate embeddings (numerical representations) for the split documents
    console.log("-- Generating embeddings... ---");
    const embeddings = new CohereEmbeddings({
      model: "embed-english-light-v2.0",
      apiKey: process.env.COHERE_API_KEY,
    });

    const pineconeIndex = pineconeClient.Index(indexName);
    const namespaceAlreadyExists = await namespaceExists(pineconeIndex, docId);
    
    if (namespaceAlreadyExists) {
        console.log(`--- Namespace ${docId} already exists, reusing existing embeddings... ---`);
    
        pineconeVectorStore = await PineconeStore.fromExistingIndex(embeddings, {
          pineconeIndex,
          namespace: docId,
        });  
    
        return pineconeVectorStore;
      } else {
        // If the namespace does not exist, download the PDF from firestore
        // via the stored Download URL & generate the embeddings and store
        // them in the Pinecone vector store
    
        const splitDocs = await generateDocs(docId);

        // Generate embeddings using the Cohere model for each document
        // const documentsWithEmbeddings = await Promise.all(
        //     splitDocs.map(async (doc) => ({
        //         ...doc,
        //         embedding: await generateCohereEmbeddings(doc.pageContent),
        //     }))
        // );
    
        console.log(
          `--- Storing the embeddings in namespace ${docId} in the ${indexName} Pinecone vector store... ---`
        );
    
        pineconeVectorStore = await PineconeStore.fromDocuments(
          splitDocs,
          embeddings,
          {
            pineconeIndex,
            namespace: docId,
          }
        );
        
        return pineconeVectorStore; 
      }
}

export async function generateLangchainCompletion(docId: string, question: string) {
    const pineconeVectorStore = await generateEmbeddingsInPineconeVectorStore(docId);
    
    if (!pineconeVectorStore) {
      throw new Error("Pinecone vector store not found");
    }
  
    // Create a retriever to search through the vector store
    console.log("--- Creating a retriever... ---");
    const retriever = pineconeVectorStore.asRetriever();
  
    // Fetch the chat history from the database
    const chatHistory = await fetchMessagesFromDB(docId);
  
    // Define a prompt template for generating search queries based on conversation history
    console.log("--- Defining a prompt template... ---");
    const historyAwarePrompt = ChatPromptTemplate.fromMessages([
      ...chatHistory, // Insert the actual chat history here
      ["user", "{input}"],
      [
        "user",
        "Given the above conversation, generate a search query to look up in order to get information relevant to the conversation",
      ],
    ]);
  
    // Create a history-aware retrieve chain that uses the model, retrieve, and prompt
    console.log("--- Creating a history-aware retriever chain... ---");
    const historyAwareRetrieverChain = await createHistoryAwareRetriever({
      llm: model,
      retriever,
      rephrasePrompt: historyAwarePrompt,
    });
  
    // Define a prompt template for answering questions based on retrieved context
    console.log("--- Defining a prompt template for answering question... ---");
    const historyAwareRetrievalPrompt = ChatPromptTemplate.fromMessages([
      [
        "system",
        "Answer the user's questions based on the below context:\n\n{context}",
      ],
      ...chatHistory, // Insert the actual chat history here
      ["user", "{input}"],
    ]);
  
    // Create a chain to combine the retrieved documents into a coherent response
    console.log("--- Creating a document combining chain... --");
    const historyAwareCombineDocsChain = await createStuffDocumentsChain({
      llm: model,
      prompt: historyAwareRetrievalPrompt,
    });
  
    // Create the main retrieval chain that combines the history-aware retriever and document combining chains
    console.log("--- Creating the main retrieval chain... ---");
    const conversationalRetrievalChain = await createRetrievalChain({
      retriever: historyAwareRetrieverChain,
      combineDocsChain: historyAwareCombineDocsChain,
    });
  
    console.log("--- Running the chain with a sample conversation... ---");
    const reply = await conversationalRetrievalChain.invoke({
      chat_history: chatHistory,
      input: question,
    });
  
    // Print the result to the console
    console.log(reply.answer);
    return reply.answer;
};