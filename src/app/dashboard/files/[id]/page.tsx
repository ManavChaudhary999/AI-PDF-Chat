import { auth } from "@clerk/nextjs/server"
import { adminDb } from "@/lib/firebase/firebaseAdmin";
import PdfView from "@/components/PDFView";
import PDFChat from "@/components/PDFChat";
  

export default async function ChatToFilePage({ params : {id} } : { params: { id: string } }) {
  auth().protect(); // Protect Route with Clerk
  const { userId } = await auth();
  
  const ref = await adminDb.collection("users").doc(userId!).collection("files").doc(id).get();

  const url = ref.data()?.downloadUrl;

  return (
    <div className="grid lg:grid-cols-5 h-full overflow-hidden">
      {/* Left Side */}
      <div className="col-span-5 lg:col-span-3 bg-gray-100 border-r-2 lg:border-indigo-600 lg:-order-1 overflow-auto">
        <PdfView url={url} />
      </div>
      {/* Right Side */}
      <div className="col-span-5 lg:col-span-2 overflow-y-auto">
        <PDFChat docId={id} />
      </div>
    </div>
  )
}