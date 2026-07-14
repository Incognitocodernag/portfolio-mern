import { useState, useRef, useEffect } from "react";
import { api } from "../utils/api";

const SUGGESTIONS = [
  "Summarize my spending trends.",
  "Am I on track to meet my budget?",
  "Suggest 3 ways to cut down transportation costs.",
  "Calculate my savings rate this month."
];

const AIAssistant = () => {
  const [messages, setMessages] = useState([
    {
      sender: "ai",
      text: "### 👋 Welcome to your **WealthifyMe AI Assistant**!\n\nI am here to help you audit your budget, analyze spending behavior, and suggest optimal savings plans.\n\nAsk me anything or select one of the suggestions below to begin.",
      date: new Date()
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = async (textToSend) => {
    const text = textToSend || input;
    if (!text.trim()) return;

    // Clear input
    if (!textToSend) setInput("");

    // Add user message
    setMessages((prev) => [...prev, { sender: "user", text, date: new Date() }]);
    setLoading(true);

    try {
      const res = await api("/ai/chat", "POST", { message: text });
      setMessages((prev) => [
        ...prev,
        { sender: "ai", text: res.reply, date: new Date(), isMock: res.isMock }
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: "⚠️ **Error**: Failed to retrieve AI response. Please make sure the backend server is running and configured correctly.",
          date: new Date()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Safe markdown helper to render basic table/bullets/bold without full md parser dependency
  const renderMessageContent = (text) => {
    // 1. Tables
    if (text.includes("|")) {
      const lines = text.split("\n");
      const tableRows = [];
      let isTable = false;
      let headers = [];

      lines.forEach((line) => {
        if (line.trim().startsWith("|") && line.trim().endsWith("|")) {
          isTable = true;
          const cols = line.split("|").map(c => c.trim()).filter(Boolean);
          if (line.includes("---")) {
            // divider row, skip
            return;
          }
          if (headers.length === 0) {
            headers = cols;
          } else {
            tableRows.push(cols);
          }
        } else {
          isTable = false;
        }
      });

      if (headers.length > 0) {
        return (
          <div className="overflow-x-auto my-3">
            <table className="w-full text-xs text-left border-collapse border border-slate-200 dark:border-white/10 rounded-lg">
              <thead>
                <tr className="bg-slate-50 dark:bg-white/5 border-b border-slate-200 dark:border-white/10">
                  {headers.map((h, i) => (
                    <th key={i} className="px-4 py-2 font-bold text-slate-700 dark:text-slate-200">{h.replace(/\*\*/g, "")}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tableRows.map((row, idx) => (
                  <tr key={idx} className="border-b border-slate-100 dark:border-white/5 hover:bg-slate-50/50 dark:hover:bg-white/5">
                    {row.map((cell, cIdx) => (
                      <td key={cIdx} className="px-4 py-2 text-slate-600 dark:text-slate-300 font-medium">
                        {cell.startsWith("**") ? <b>{cell.replace(/\*\*/g, "")}</b> : cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }
    }

    // 2. Headings & Bullets fallback
    return text.split("\n").map((line, idx) => {
      const trimmed = line.trim();
      if (trimmed.startsWith("###")) {
        return <h3 key={idx} className="text-base font-bold text-slate-900 dark:text-white mt-4 mb-2">{trimmed.replace("###", "").trim()}</h3>;
      }
      if (trimmed.startsWith("####")) {
        return <h4 key={idx} className="text-sm font-bold text-slate-900 dark:text-white mt-3 mb-1.5">{trimmed.replace("####", "").trim()}</h4>;
      }
      if (trimmed.startsWith("##")) {
        return <h2 key={idx} className="text-lg font-bold text-slate-900 dark:text-white mt-5 mb-2.5">{trimmed.replace("##", "").trim()}</h2>;
      }
      if (trimmed.startsWith("*") || trimmed.startsWith("-")) {
        // Parse bold elements in line: **bold**
        const content = trimmed.substring(1).trim();
        return (
          <li key={idx} className="ml-4 list-disc text-sm text-slate-700 dark:text-slate-300 mb-1 leading-relaxed">
            {parseBoldText(content)}
          </li>
        );
      }
      if (/^\d+\./.test(trimmed)) {
        const content = trimmed.replace(/^\d+\./, "").trim();
        return (
          <li key={idx} className="ml-4 list-decimal text-sm text-slate-700 dark:text-slate-300 mb-1 leading-relaxed">
            {parseBoldText(content)}
          </li>
        );
      }
      if (trimmed) {
        return <p key={idx} className="text-sm text-slate-700 dark:text-slate-300 mb-2 leading-relaxed">{parseBoldText(trimmed)}</p>;
      }
      return <div key={idx} className="h-2" />;
    });
  };

  const parseBoldText = (text) => {
    if (!text.includes("**")) return text;
    const parts = text.split("**");
    return parts.map((part, i) => i % 2 === 1 ? <b key={i} className="text-slate-900 dark:text-white font-bold">{part}</b> : part);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] max-w-4xl mx-auto bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-2xl overflow-hidden shadow-sm">
      
      {/* Header Banner */}
      <div className="px-6 py-4 bg-slate-50 dark:bg-white/5 border-b border-slate-100 dark:border-dark-border flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-400 text-xl font-bold">
            ✨
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">AI Financial Assistant</h2>
            <p className="text-xs text-slate-400">Conversational insights & automated category audits</p>
          </div>
        </div>
        <div className="px-2.5 py-1 rounded-full bg-teal-500/10 text-[10px] font-semibold text-teal-400 uppercase tracking-wider">
          Gemini Powered
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-6">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex gap-3 max-w-[85%] ${msg.sender === "user" ? "self-end flex-row-reverse" : "self-start"}`}>
            
            {/* Sender Avatar */}
            <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-sm ${
              msg.sender === "user" ? "bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-slate-300" : "bg-teal-500 text-white font-bold"
            }`}>
              {msg.sender === "user" ? "👤" : "✨"}
            </div>

            {/* Message Bubble */}
            <div className={`rounded-2xl p-4 text-sm ${
              msg.sender === "user"
                ? "bg-teal-500 text-white shadow-sm shadow-teal-500/10 rounded-tr-none"
                : "bg-slate-50 dark:bg-[#070b16] border border-slate-100 dark:border-white/5 rounded-tl-none text-slate-800 dark:text-slate-300"
            }`}>
              <div className="prose prose-sm dark:prose-invert">
                {renderMessageContent(msg.text)}
              </div>
              {msg.isMock && (
                <div className="mt-3 text-[10px] text-slate-400 border-t border-slate-200/50 dark:border-white/5 pt-2">
                  *Running in offline mock mode. Enable GEMINI_API_KEY in the backend for real-time AI reasoning.*
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Loading Indicator */}
        {loading && (
          <div className="flex gap-3 max-w-[80%] self-start">
            <div className="w-8 h-8 rounded-full bg-teal-50 flex items-center justify-center text-teal-400 text-sm font-bold animate-pulse">
              ✨
            </div>
            <div className="bg-slate-50 dark:bg-[#070b16] border border-slate-100 dark:border-white/5 rounded-2xl rounded-tl-none p-4 flex items-center gap-1">
              <span className="w-2.5 h-2.5 bg-slate-300 dark:bg-slate-600 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
              <span className="w-2.5 h-2.5 bg-slate-300 dark:bg-slate-600 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
              <span className="w-2.5 h-2.5 bg-slate-300 dark:bg-slate-600 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
            </div>
          </div>
        )}
        
        <div ref={scrollRef} />
      </div>

      {/* Suggested Templates (Only show if no messages have been sent by the user yet) */}
      {messages.length === 1 && !loading && (
        <div className="px-6 py-3 border-t border-slate-100 dark:border-dark-border bg-slate-50/50 dark:bg-[#040810]/35">
          <p className="text-xs text-slate-400 mb-2 font-medium">Suggestions</p>
          <div className="flex flex-wrap gap-2">
            {SUGGESTIONS.map((sug, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(sug)}
                className="px-3.5 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-white dark:bg-dark-card border border-slate-200 dark:border-white/10 rounded-xl hover:border-teal-500 dark:hover:border-teal-400 hover:text-teal-500 dark:hover:text-teal-400 transition-all duration-150 shadow-sm"
              >
                {sug}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Form */}
      <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="p-4 border-t border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-dark-card flex gap-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about your budget, highest expenses, saving goals..."
          disabled={loading}
          className="flex-1 px-4 py-3 bg-white dark:bg-[#040810] border border-slate-200 dark:border-white/10 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-teal-500 transition-colors"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="px-5 py-3 rounded-xl bg-teal-500 text-white font-bold hover:bg-teal-600 active:bg-teal-700 transition-colors disabled:opacity-50 text-sm shadow-md shadow-teal-500/25"
        >
          Send
        </button>
      </form>

    </div>
  );
};

export default AIAssistant;
