import { ChatContainer } from "@/components/chat/chat-container";

export default function Home() {
  return (
    <main className="h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-0 md:p-4 lg:p-6 overflow-hidden">
      <div className="w-full h-full max-w-[1600px] bg-white dark:bg-slate-900 md:rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row relative">
        <ChatContainer />
      </div>
    </main>
  );
}