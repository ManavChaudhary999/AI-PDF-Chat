"use client";

import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

import { Document, Page, pdfjs } from "react-pdf";
import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Loader2Icon, RotateCw, ZoomInIcon, ZoomOutIcon } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

// We need to configure CORS for firebase downloads from browser, here are the steps:
// 1. go here >>> https://console.cloud.google.com/
// 2. Go to your project and open a new cloud shell (top right corner).
// 3. create new file in the editor called cors.json.
// 4. paste the below code:
//      [
//       {
//           "origin": ["*"],
//           "method": ["GET"],
//           "maxAgeSeconds": 3600
//       }
//      ]
// 5. save the file
// 6. open the terminal in the shell and run the below command:
//          gsutil cors set cors.json gs://<app-name>.appspot.com
// Example: gsutil cors set cors.json gs://chat-with-pdf-5895a.appspot.com
// 
// For details click here: https://firebase.google.com/docs/storage/web/download-files#cors_configuration

// react-pdf worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

function PdfView({ url }: { url: string }) {
  const [numPages, setNumPages] = useState<number>();
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [file, setFile] = useState<Blob | null>(null);
  const [rotation, setRotation] = useState<number>(0);
  const [scale, setScale] = useState<number>(1);

  useEffect(() => {
    const fetchFile = async () => {
      try{
        const res = await fetch(url);
        const file = await res.blob();
        setFile(file);
      } catch(err) {
          console.log(err);
      }
    };

    fetchFile();
  }, [url]);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }): void => {
    setNumPages(numPages);
  };

  return (
    <div className="flex flex-col justify-center items-center">
      <div className="sticky top-0 z-50 bg-gray-100 p-2 rounded-b-lg">
        <div className="max-w-6xl px-2 grid grid-cols-6 gap-2 items-center">
          <Button
            variant="outline"
            disabled={pageNumber === 1}
            onClick={() => {
              if (pageNumber > 1) {
                setPageNumber(pageNumber - 1);
              }
            }}
          >
            Previous
          </Button>

          <p className="flex item-center justify-center">
            {pageNumber} of {numPages}
          </p>

          <Button
            variant="outline"
            disabled={pageNumber === numPages}
            onClick={() => {
              if (numPages) {
                if (pageNumber < numPages) {
                  setPageNumber(pageNumber + 1);
                }
              }
            }}
          >
            Next
          </Button>

          <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="outline"
                            onClick={() => setRotation((rotation + 90) % 360)}
                        >
                            <RotateCw />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        Rotate
                    </TooltipContent>
                </Tooltip>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="outline"
                            disabled={scale >= 1.5}
                            onClick={() => {
                            setScale(scale * 1.2);
                            }}
                        >
                            <ZoomInIcon />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        Zoom In
                    </TooltipContent>
                </Tooltip>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="outline"
                            disabled={scale <= 0.75}
                            onClick={() => {
                            setScale(scale / 1.2);
                            }}
                        >
                            <ZoomOutIcon />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        Zoom Out
                    </TooltipContent>
                </Tooltip>
          </TooltipProvider>  
        </div>
      </div>
      {!file ? (
        <Loader2Icon className="animate-spin h-20 w-20 text-indigo-600 mt-20" />
      ) : (
        <Document
          loading={null}
          file={file}
          rotate={rotation}
          onLoadSuccess={onDocumentLoadSuccess}
          className="m-4"
        >
          <Page className="shadow-lg" scale={scale} pageNumber={pageNumber} />
        </Document>
      )}
    </div>
  );
}
export default PdfView;