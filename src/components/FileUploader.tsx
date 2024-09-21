'use client'
import {useCallback, useEffect} from 'react';
import {useDropzone} from 'react-dropzone';
import { useRouter } from 'next/navigation';
import {
    CheckCircleIcon,
    CircleArrowDown,
    HammerIcon,
    RocketIcon,
    SaveIcon,
  } from "lucide-react";
import useUpload, { StatusText } from '@/hooks/useUpload';
import {useToast} from "@/hooks/use-toast";
import { ToastAction } from "./ui/toast";
import useSubscription from '@/hooks/useSubscription';


const statusIcons: Record<StatusText, JSX.Element> = {
  [StatusText.UPLOADING]: (
    <RocketIcon className="h-20 w-20 text-indigo-600" />
  ),
  [StatusText.UPLOADED]: (
    <CheckCircleIcon className="h-20 w-20 text-indigo-600" />
  ),
  [StatusText.SAVING]: <SaveIcon className="h-20 w-20 text-indigo-600" />,
  [StatusText.GENERATING]: (
    <HammerIcon className="h-20 w-20 text-indigo-600 animate-bounce" />
  ),
};

export default function FileUploader() {
  const { progress, status, fileId, handleUpload } = useUpload(); // Custom Hook
  const uploadInProgress = progress !== null && progress >= 0 && progress <= 100;
  
  const { hasActiveMembership, isOverFileLimit, filesLoading } = useSubscription();

  const router = useRouter();
  const {toast} = useToast();

  useEffect(() => {
    if(fileId) {
      router.push(`/dashboard/files/${fileId}`);
    }
  }, [fileId, router]);


  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if(file) {
      if(!isOverFileLimit && !filesLoading ) { // If File limit not reached
        // Upload File
        await handleUpload(file);
        return;
      }
      else { // If file limit reached
        if(!hasActiveMembership){
          toast({
            variant: "destructive",
            title: "Free Plan File Limit Reached",
            description:
              "You have reached the maximum number of files allowed for your account. Please upgrade to add more documents.",
            action: (
                <ToastAction onClick={() => router.push("/dashboard/upgrade")} altText="Upgrade to Pro">
                    Upgrade to Pro
                </ToastAction>
            ),
          });
        }
        else {
          toast({
              variant: "destructive",
              title: "Pro Plan File Limit Reached",
              description:
                "You have reached the maximum number of files allowed for your account. Please Delete old files to add more documents.",
          });
        }
      }
    } else {
      // Error
      toast({
        variant: "destructive",
        title: "Error Uploading File",
        description:
          "Your file is too large to compile",
      });
    }
  }, [handleUpload, isOverFileLimit, filesLoading, hasActiveMembership, , router, toast]);


  const {getRootProps, getInputProps, isDragActive, isFocused, isDragAccept } = useDropzone({
    onDrop,
    maxFiles: 1,
    'accept': {
      'application/pdf': ['.pdf']
    },
  });

  
  return (
    <div className="flex flex-col gap-4 items-center max-w-7xl mx-auto">
      {uploadInProgress && (
        <div className="mt-32 flex flex-col justify-center items-center gap-5">
          <div
            className={`radial-progress bg-indigo-300 text-white 
            border-indigo-600 border-4 ${progress === 100 && "hidden"}`}
            role="progressbar"
            style={
              {
                "--value": progress,
                "--size": "12rem",
                "--thickness": "1.3rem",
              } as React.CSSProperties
            }
          >
            {progress} %
          </div>

          {/* Render Status Icon */}
          {status && statusIcons[status as StatusText]}

          <p>{status?.toString()}</p>
        </div>
      )}

      {!uploadInProgress && (
        <div {...getRootProps()}
        className={`p-10 border-2 border-dashed mt-10 w-[90%] border-indigo-600 text-indigo-600
            rounded-lg h-96 flex items center justify-center ${isFocused || isDragAccept ? "bg-indigo-300" : "bg-indigo-100"}`}>
            
            <input {...getInputProps()} />
            <div className="flex flex-col justify-center items-center">
                {isDragActive ? (
                <>
                    <RocketIcon className="h-20 w-20 animate-ping" />
                    <p>Drop the files here ...</p>
                </>
                ) : (
                <>
                    <CircleArrowDown className="h-20 w-20 animate-bounce" />
                    <p>
                    Drag &apos;n&apos; drop some files here, or click to select
                    files
                    </p>
                </>
                )}
            </div>
        </div>
      )}

    </div>
  )
}