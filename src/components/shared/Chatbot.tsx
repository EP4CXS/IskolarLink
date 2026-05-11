import { useEffect, useState, useRef } from 'react';
import { MessageCircle, X, Send, Bot, User as UserIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiChatGroq, type ChatGroqMessage } from '../../lib/api';

const ISKOLARLINK_SYSTEM_PROMPT = `You are the IskolarLink Assistant for a scholarship management web application used by students and admins.
Help clearly and briefly with: browsing and applying for scholarships; required documents (COR, Student ID, Prospectus, Certificate of Indigency); application statuses (Pending, Under Review, Screened, Approved, Rejected) and where to track them (My Applications); announcements and targeted audiences; grant disbursement and transaction history; archived application history when scholarships end; exporting reports (CSV); updating student profile (name, avatar, course, year level, contact, address).
If the user asks for data you cannot see (exact deadlines, live slot counts, their personal application state), tell them to open the relevant page in the app for up-to-date information.`;
interface Message {
  id: string;
  text: string;
  sender: 'bot' | 'user';
}
const FAQ_RULES = [
{
  keywords: [
  'scholarship available',
  'scholarships available',
  'available scholarship',
  'available scholarships',
  'open scholarship',
  'open scholarships',
  'is there scholarship',
  'are there scholarships',
  'what scholarship',
  'what scholarships',
  'list of scholarship',
  'list of scholarships'
  ],
  answer:
  'You can check available scholarship programs in the "Scholarships" page. Open scholarships are listed there with details, deadlines, and requirements.'
},
{
  keywords: [
  'how to apply',
  'apply scholarship',
  'application process',
  'how can i apply',
  'steps to apply',
  'submit application',
  'apply now',
  'where to apply'
  ],
  answer:
  'Go to the Scholarships page, choose a scholarship, then click Apply. Fill in Personal Info, Academic Info, upload required documents (COR, Student ID, Prospectus, Certificate of Indigency), review your details, then submit.'
},
{
  keywords: ['deadline', 'when deadline', 'application period'],
  answer:
  'Most scholarship deadlines are around August 15th, but please check the specific scholarship details page for exact dates.'
},
{
  keywords: ['requirements', 'documents', 'need', 'requirements needed', 'required docs'],
  answer:
  'Common requirements include Certificate of Registration (COR), Student ID, Prospectus, and Certificate of Indigency. Upload these in the application documents step.'
},
{
  keywords: ['status', 'track', 'application status', 'track application', 'where is my application'],
  answer:
  'You can track your application status in the "My Applications" tab. The statuses are Pending, Under Review, Screened, Approved, or Rejected.'
},
{
  keywords: ['eligibility', 'gpa', 'grades', 'qualified', 'qualification', 'who can apply'],
  answer:
  'Eligibility varies per scholarship. The system will automatically check your profile GPA and course against the scholarship criteria when you try to apply.'
},
{
  keywords: ['announcement', 'announcements', 'target audience', 'beneficiary'],
  answer:
  'Announcements can be posted by admins and targeted by scholarship program (TES, CUSCHO, TDP) or to all. Targeted announcements are shown to approved beneficiaries.'
},
{
  keywords: ['grant', 'disbursement', 'release grant', 'grant release', 'when grant release', 'next grant release'],
  answer:
  'Admins release grants in Grant Disbursement for approved beneficiaries. Transactions are recorded and visible in application details as transaction history.'
},
{
  keywords: ['history', 'application history', 'past scholarship', 'archive', 'archived application'],
  answer:
  'Students can open My Applications > View History to see past scholarship records. History is archived and stored in the database when a scholarship ends or an application is rejected.'
},
{
  keywords: ['end scholarship', 'delete scholarship', 'remove scholarship'],
  answer:
  'Ending a scholarship does not delete applicant history. It marks the scholarship as Closed, archives applicant records, and removes it from active disbursement.'
},
{
  keywords: ['report', 'export', 'csv', 'download report', 'analytics'],
  answer:
  'In Reports & Analytics, Export Report downloads a CSV file containing applicant and beneficiary records based on current filters.'
},
{
  keywords: ['profile', 'update profile', 'student profile', 'edit profile', 'change profile'],
  answer:
  'Students can update profile info such as name, avatar, course/program, year level, phone number, and address. Changes are saved to the database.'
},
{
  keywords: ['hello', 'hi', 'help', 'assist'],
  answer:
  'Hello! I am the IskolarLink Assistant. Ask me about applications, announcements, grant disbursement, histories, reports, and profile updates.'
}];

function getBestFaqAnswer(input: string): string {
  const normalized = input.toLowerCase().trim();
  let bestScore = 0;
  let bestAnswer = '';

  for (const rule of FAQ_RULES) {
    const score = rule.keywords.reduce(
      (acc, kw) => (normalized.includes(kw.toLowerCase()) ? acc + 1 : acc),
      0
    );
    if (score > bestScore) {
      bestScore = score;
      bestAnswer = rule.answer;
    }
  }

  if (bestScore > 0) return bestAnswer;
  return 'I can help with system features: application steps, requirements, status tracking, announcements, grant disbursement, application history, scholarship end/archive flow, reports export, and profile updates.';
}

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
  const requestInFlightRef = useRef(false);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth'
    });
  };
  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);
  const handleSend = async () => {
    const text = input.trim();
    if (!text || requestInFlightRef.current) return;

    requestInFlightRef.current = true;

    const userMsg: Message = {
      id: Date.now().toString(),
      text,
      sender: 'user',
    };
    const historyForApi = [...messages, userMsg];

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    const groqMessages: ChatGroqMessage[] = [
      { role: 'system', content: ISKOLARLINK_SYSTEM_PROMPT },
      ...historyForApi.map((m) => ({
        role: m.sender === 'user' ? ('user' as const) : ('assistant' as const),
        content: m.text,
      })),
    ];

    try {
      const reply = await apiChatGroq(groqMessages);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          text: reply,
          sender: 'bot',
        },
      ]);
    } catch {
      const fallback = getBestFaqAnswer(text);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          text:
            "I couldn't reach the AI assistant. Here's a quick answer from our built-in help: " +
            fallback,
          sender: 'bot',
        },
      ]);
    } finally {
      setIsTyping(false);
      requestInFlightRef.current = false;
    }
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
                  <p className="text-xs text-sky-100">Groq AI · FAQ fallback if offline</p>
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
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
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