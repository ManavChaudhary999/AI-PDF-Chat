import { Button } from "@/components/ui/button";
import {
  BrainCogIcon,
  EyeIcon,
  GlobeIcon,
  MonitorSmartphoneIcon,
  ServerCogIcon,
  ZapIcon,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";


const features = [
  {
    name: "Store Your PDF Documents",
    description:
      "Keep all your important PDF files securely stored and easily accessible anytime, anywhere.",
    icon: GlobeIcon,
  },
  {
    name: "Blazing Fast Response",
    description:
      "Experience lightning-fast answers to your queries, ensuring you get the information you need instantly.",
    icon: ZapIcon,
  },
  {
    name: "Chat Memorization",
    description:
      "Our intelligent chatbot remembers previous interactions, providing a seamless and personalized experience.",
    icon: BrainCogIcon,
  },
  {
    name: "Interactive PDF Viewer",
    description:
      "Engage with your PDFs like never before using our intuitive and interactive viewer.",
    icon: EyeIcon,
  },
  {
    name: "Cloud Backup",
    description:
      "Rest assured knowing your documents are safely backed up on the cloud, protected from loss or damage.",
    icon: ServerCogIcon,
  },
  {
    name: "Responsive Across Devices",
    description:
      "Access and chat with you PDFs seamlessly on any device, whether it's your desktop, tablet, or smartphone.",
    icon: MonitorSmartphoneIcon,
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground mx-auto max-w-7xl p-6 lg:p-8">
      
      <div className="mx-auto max-w-2xl sm:text-center">
        <p className="text-base font-semibold leading-7 text-indigo-600">Your Interactive Document Companion</p>
        <h1 className="mt-2 text-4xl sm:text-5xl md:text-6xl font-bold leading-tight">
          Transform Your PDFs into<br />Interactive Conversations
        </h1>
        <p className="mt-6 text-xl font-semibold text-muted-foreground">Introducing <span className="text-indigo-600">Chat with PDF.</span></p>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Upload your document, and our chatbot will answer questions, summarize content,
          and answer all your Qs. Ideal for everyone, <span className="text-indigo-600">Chat with PDF</span> turns static documents
          into <span className="font-bold">dynamic conversations</span>, enhancing productivity 10x fold effortlessly.
        </p>
        <Button asChild size="lg" className="mt-8">
          <Link href="/dashboard">Get Started</Link>
        </Button>
      </div>

      <div className="relative overflow-hidden pt-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <Image
            alt="App Screenshot"
            src={"https://i.imgur.com/VciRSTI.jpeg"}
            width={2432}
            height={1442}
            className="mb-[-0%] rounded-xl shadow-2xl ring-1 ring-gray-900/10"
          />
          <div aria-hidden="true" className="relative">
            <div className="absolute bottom-0 -inset-x-32 bg-gradient-to-t from-white/95 pt-[5%]" />
          </div>
        </div>
      </div>

      <div className="mx-auto mt-16 max-w-7xl px-6 sm:mt-20 md:mt-24 lg:px-8">
          <dl className="mx-auto grid max-w-2xl grid-cols-1 gap-x-6 gap-y-10 text-base leading-7 text-gray-600 sm:grid-cols-2 lg:mx-0 lg:max-w-none lg:grid-cols-3 lg:gap-x-8 lg:gap-y-16">
            {features.map((feature) => (
              <div className="relative pl-9" key={feature.name}>
                <dt className="inline font-semibold text-gray-900">
                  <feature.icon
                    aria-hidden="true"
                    className="absolute left-1 top-1 h-5 w-5 text-indigo-600"
                  />
                </dt>

                <dd>{feature.description}</dd>
              </div>
            ))}
          </dl>
      </div>

    </div>
  )
}