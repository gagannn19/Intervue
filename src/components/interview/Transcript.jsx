export function Transcript({ messages, aiThinking, endRef }) {
  return (
    <div className="flex-1 overflow-y-auto p-5 space-y-3">
      {messages.map((m, i) => (
        <div key={i} className={`flex ${m.from === "user" ? "justify-end" : "justify-start"}`}>
          <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
            m.from === "user" ? "bg-[#6D5EF8] text-white rounded-br-sm" : "bg-white/8 text-white/90 rounded-bl-sm"
          }`}>
            {m.text}
          </div>
        </div>
      ))}
      {aiThinking && (
        <div className="flex justify-start">
          <div className="bg-white/8 rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1">
            {[0, 1, 2].map((i) => (
              <span key={i} className="w-1.5 h-1.5 rounded-full bg-white/50 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
            ))}
          </div>
        </div>
      )}
      <div ref={endRef} />
    </div>
  );
}
