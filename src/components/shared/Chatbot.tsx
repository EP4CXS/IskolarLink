import React, { useEffect, useState, useRef } from 'react';
import { MessageCircle, X, Send, Bot, User as UserIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
interface Message {
  id: string;
  text: string;
  sender: 'bot' | 'user';
}
const FAQ_RULES = [
{
  keywords: ['deadline', 'when'],
  answer:
  'Most scholarship deadlines are around August 15th, but please check the specific scholarship details page for exact dates.'
},
{
  keywords: ['requirements', 'documents', 'need'],
  answer:
  'Common requirements include your Transcript of Records, Certificate of Indigency (if applicable), and a valid ID. You can upload these in your Profile or during application.'
},
{
  keywords: ['status', 'track'],
  answer:
  'You can track your application status in the "My Applications" tab. The statuses are Pending, Under Review, Screened, Approved, or Rejected.'
},
{
  keywords: ['eligibility', 'gpa', 'grades'],
  answer:
  'Eligibility varies per scholarship. The system will automatically check your profile GPA and course against the scholarship criteria when you try to apply.'
},
{
  keywords: ['hello', 'hi', 'help'],
  answer:
  'Hello! I am the IskolarLink Assistant. You can ask me about deadlines, requirements, application status, or eligibility.'
}];

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
  {
    id: '1',
    text: 'Hi there! I am the IskolarLink Assistant. How can I help you today?',
    sender: 'bot'
  }]
  );
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth'
    });
  };
  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);
  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg: Message = {
      id: Date.now().toString(),
      text: input,
      sender: 'user'
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);
    // Simple rule-based matching
    setTimeout(() => {
      const lowerInput = userMsg.text.toLowerCase();
      let foundAnswer =
      "I'm not quite sure about that. Please check the announcements or contact the admin office for specific inquiries.";
      for (const rule of FAQ_RULES) {
        if (rule.keywords.some((kw) => lowerInput.includes(kw))) {
          foundAnswer = rule.answer;
          break;
        }
      }
      setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        text: foundAnswer,
        sender: 'bot'
      }]
      );
      setIsTyping(false);
    }, 1000);
  };
  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 p-4 bg-sky-600 text-white rounded-full shadow-lg hover:bg-sky-700 transition-transform hover:scale-105 z-40 ${isOpen ? 'hidden' : 'flex'}`}>
        
        <MessageCircle className="w-6 h-6" />
      </button>

      <AnimatePresence>
        {isOpen &&
        <motion.div
          initial={{
            opacity: 0,
            y: 20,
            scale: 0.95
          }}
          animate={{
            opacity: 1,
            y: 0,
            scale: 1
          }}
          exit={{
            opacity: 0,
            y: 20,
            scale: 0.95
          }}
          className="fixed bottom-6 right-6 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 flex flex-col overflow-hidden"
          style={{
            height: '500px',
            maxHeight: '80vh'
          }}>
          
            {/* Header */}
            <div className="bg-sky-600 p-4 flex items-center justify-between text-white">
              <div className="flex items-center gap-2">
                <Bot className="w-6 h-6" />
                <div>
                  <h3 className="font-semibold">IskolarLink Assistant</h3>
                  <p className="text-xs text-sky-100">Online | Automated FAQ</p>
                </div>
              </div>
              <button
              onClick={() => setIsOpen(false)}
              className="text-sky-100 hover:text-white transition-colors">
              
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 p-4 overflow-y-auto bg-gray-50 flex flex-col gap-3">
              {messages.map((msg) =>
            <div
              key={msg.id}
              className={`flex gap-2 max-w-[85%] ${msg.sender === 'user' ? 'self-end flex-row-reverse' : 'self-start'}`}>
              
                  <div
                className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.sender === 'bot' ? 'bg-sky-100 text-sky-600' : 'bg-gray-200 text-gray-600'}`}>
                
                    {msg.sender === 'bot' ?
                <Bot className="w-4 h-4" /> :

                <UserIcon className="w-4 h-4" />
                }
                  </div>
                  <div
                className={`p-3 rounded-2xl text-sm ${msg.sender === 'user' ? 'bg-sky-600 text-white rounded-tr-none' : 'bg-white border border-gray-200 text-gray-800 rounded-tl-none'}`}>
                
                    {msg.text}
                  </div>
                </div>
            )}
              {isTyping &&
            <div className="flex gap-2 max-w-[85%] self-start">
                  <div className="w-8 h-8 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="p-4 rounded-2xl bg-white border border-gray-200 rounded-tl-none flex gap-1">
                    <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{
                    animationDelay: '0ms'
                  }} />
                
                    <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{
                    animationDelay: '150ms'
                  }} />
                
                    <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{
                    animationDelay: '300ms'
                  }} />
                
                  </div>
                </div>
            }
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 bg-white border-t border-gray-200">
              <div className="flex gap-2">
                <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask a question..."
                className="flex-1 px-3 py-2 bg-gray-100 border-transparent rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition-colors" />
              
                <button
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
                className="p-2 bg-sky-600 text-white rounded-full hover:bg-sky-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        }
      </AnimatePresence>
    </>);

}