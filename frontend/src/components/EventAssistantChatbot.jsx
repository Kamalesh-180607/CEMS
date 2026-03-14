import { useState } from "react";
import { FiMessageCircle, FiSend, FiX } from "react-icons/fi";
import { aiApi } from "../services/api";

export default function EventAssistantChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "Hi! I am your event assistant. Ask about events, registrations, or announcements.",
    },
  ]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const nextMessages = [...messages, { role: "user", text }];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    try {
      const { data } = await aiApi.chat(text);
      setMessages((prev) => [...prev, { role: "assistant", text: data.reply || "I could not answer right now." }]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: "Sorry, I couldn't answer that right now. Please check the events page." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await sendMessage();
  };

  return (
    <>
      <button type="button" className="assistant-fab" onClick={() => setIsOpen((prev) => !prev)} aria-label="Open event assistant">
        {isOpen ? <FiX size={20} /> : <FiMessageCircle size={20} />}
      </button>

      {isOpen ? (
        <div className="assistant-chat-window" role="dialog" aria-label="Event assistant chatbot">
          <div className="assistant-chat-header">
            <div>
              <h6 className="mb-0">Event Assistant</h6>
              <small>Ask anything about campus events</small>
            </div>
            <span className="assistant-bot-icon" aria-hidden="true">🤖</span>
          </div>

          <div className="assistant-chat-body">
            {messages.map((message, index) => (
              <div key={`${message.role}-${index}`} className={`assistant-message ${message.role}`}>
                {message.text}
              </div>
            ))}
            {loading ? <div className="assistant-message assistant">Thinking...</div> : null}
          </div>

          <form className="assistant-chat-input" onSubmit={handleSubmit}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about events, workshops, registrations..."
            />
            <button type="submit" disabled={loading || !input.trim()} aria-label="Send message">
              <FiSend size={16} />
            </button>
          </form>
        </div>
      ) : null}
    </>
  );
}
