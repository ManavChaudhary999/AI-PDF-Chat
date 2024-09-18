import { auth } from "@clerk/nextjs/server";
import { adminDb } from "@/lib/firebase/firebaseAdmin";
import PlaceholderDocumentPreview from "./PlaceholderDocumentPreview";
import DocumentPreview from "./DocumentPreview";

async function Documents() {
  auth().protect();
  const { userId } = await auth();

  if (!userId) {
    throw new Error("User not found");
  }

  const documentsSnapshot = await adminDb
    .collection("users")
    .doc(userId)
    .collection("files")
    .orderBy("createdAt")
    .get();

  return (
    <div className="flex flex-wrap p-5 bg-gray-100 justify-center lg:justify-start rounded-sm gap-5 max-w-7xl mx-auto">
      {documentsSnapshot.docs.map((doc) => {
        const { name, downloadUrl, size, createdAt } = doc.data();

        return (
          <DocumentPreview
            key={doc.id}
            id={doc.id}
            name={name}
            size={size}
            downloadUrl={downloadUrl}
            createdAt={createdAt.toDate().toLocaleString()}
          />
        );
      })}

      <PlaceholderDocumentPreview />
    </div>
  );
}
export default Documents;