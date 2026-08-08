"use client";

import { useState, useRef, useEffect } from "react";
import { useUser, SignInButton } from "@clerk/nextjs";
import { card, button, input } from "@/lib/ui";
import { SparklesIcon } from "@/components/icons";
import ReactMarkdown from "react-markdown";

interface Message {
  role: "user" | "model";
  content: string;
}

export default function InterviewSimulatorPage() {
  const { isSignedIn, isLoaded } = useUser();
  const [context, setContext] = useState("");
  const [started, setStarted] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputStr, setInputStr] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (!isLoaded) return <div className="p-8 text-center">Loading...</div>;

  if (!isSignedIn) {
    return (
      <div className="flex flex-col items-center justify-center p-10">
        <h1 className="mb-4 text-2xl font-bold text-[var(--text-primary)]">AI Interview Simulator</h1>
        <p className="mb-6 text-[var(--text-secondary)]">Sign in to practice mock interviews with Gemini!</p>
        <SignInButton mode="modal">
          <button className={button.primary}>Sign In to Continue</button>
        </SignInButton>
      </div>
    );
  }

  async function handleSend() {
    if (!inputStr.trim()) return;
    
    const newMessages: Message[] = [...messages, { role: "user", content: inputStr }];
    setMessages(newMessages);
    setInputStr("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/interview/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages, context }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setMessages([...newMessages, { role: "model", content: data.text }]);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to simulate interview");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 py-6 h-[calc(100vh-100px)]">
      {!started ? (
        <div className={`p-8 ${card}`}>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">AI Interview Simulator</h1>
          <p className="mb-6 mt-2 text-[var(--text-secondary)]">Set the context for your mock interview. E.g., &quot;TCS Ninja Technical Round for Java Backend&quot; or &quot;Amazon SDE Behavioral Round&quot;.</p>
          <div className="flex flex-col gap-4">
            <input 
              type="text" 
              placeholder="Enter interview context..." 
              className={`${input}`} 
              value={context}
              onChange={(e) => setContext(e.target.value)}
            />
            <button 
              onClick={() => {
                if (context.trim()) setStarted(true);
              }} 
              disabled={!context.trim()} 
              className={`${button.primary} self-start`}
            >
              Start Interview
            </button>
          </div>
        </div>
      ) : (
        <div className={`flex flex-1 flex-col overflow-hidden ${card}`}>
          <div className="border-b border-[var(--border-default)] bg-[var(--surface-muted)] p-4">
            <h2 className="font-semibold text-[var(--text-primary)]">Interview Context: {context}</h2>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && (
              <div className="text-center text-[var(--text-secondary)] py-10">
                <p>Say &quot;Hi, I am ready for the interview&quot; to begin.</p>
              </div>
            )}
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] rounded-2xl px-5 py-3 ${
                  msg.role === "user" 
                    ? "bg-indigo-600 text-white" 
                    : "bg-[var(--surface-muted)] text-[var(--text-primary)] border border-[var(--border-default)]"
                }`}>
                  {msg.role === "model" && <SparklesIcon width={14} height={14} className="mb-2 text-indigo-500" />}
                  <div className={`prose prose-sm dark:prose-invert ${msg.role === "user" ? "prose-p:text-white" : ""}`}>
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="max-w-[80%] rounded-2xl border border-[var(--border-default)] bg-[var(--surface-muted)] px-5 py-3 text-[var(--text-secondary)]">
                  <span className="flex items-center gap-2">
                    <SparklesIcon width={14} height={14} className="animate-spin text-indigo-500" />
                    Interviewer is typing...
                  </span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="border-t border-[var(--border-default)] bg-[var(--surface-card)] p-4">
            <div className="flex gap-3">
              <input 
                type="text" 
                placeholder="Type your answer..." 
                className={`${input} flex-1`} 
                value={inputStr}
                onChange={(e) => setInputStr(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                disabled={isLoading}
              />
              <button onClick={handleSend} disabled={!inputStr.trim() || isLoading} className={button.primary}>
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
