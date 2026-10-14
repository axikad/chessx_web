import React, { useState } from 'react';
import {
  Send,
  Paperclip,
  Smile,
  Search,
  MoreVertical,
  Phone,
  Video,
  CheckCheck,
} from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useToast } from '../../context/ToastContext';

interface ChatContact {
  id: string;
  name: string;
  role: string;
  avatar: string;
  online: boolean;
  unread: number;
  lastMessage: string;
  lastTime: string;
}

interface ChatMessage {
  id: string;
  senderId: string;
  text: string;
  time: string;
  isMe: boolean;
}

export const ChatPage: React.FC = () => {
  const { toast } = useToast();

  const [contacts] = useState<ChatContact[]>([
    {
      id: 'c1',
      name: 'Elena Rostova',
      role: 'Logistics Lead',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      online: true,
      unread: 2,
      lastMessage: 'The new shipment of 34-inch displays arrived at Reno depot.',
      lastTime: '10:42 AM',
    },
    {
      id: 'c2',
      name: 'Sofia Chen',
      role: 'Design Director',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      online: true,
      unread: 0,
      lastMessage: 'Uploaded the revised checkout UI components to Figma.',
      lastTime: '09:15 AM',
    },
    {
      id: 'c3',
      name: 'Marcus Vance',
      role: 'Senior Backend Engineer',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      online: false,
      unread: 0,
      lastMessage: 'API endpoints for Laravel Sanctum authentication are ready.',
      lastTime: 'Yesterday',
    },
    {
      id: 'c4',
      name: 'David Kim',
      role: 'Security & DevOps',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      online: false,
      unread: 0,
      lastMessage: 'All TLS certificates renewed for the commercial gateway.',
      lastTime: '2d ago',
    },
  ]);

  const [activeContact, setActiveContact] = useState<ChatContact>(contacts[0]);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm1',
      senderId: 'c1',
      text: 'Good morning Alexander! Quick update on the inventory arrival.',
      time: '10:38 AM',
      isMe: false,
    },
    {
      id: 'm2',
      senderId: 'me',
      text: 'Good morning Elena! Have the custom customs clearance papers been approved?',
      time: '10:40 AM',
      isMe: true,
    },
    {
      id: 'm3',
      senderId: 'c1',
      text: 'Yes! The new shipment of 34-inch displays arrived at Reno depot and was verified into stock.',
      time: '10:42 AM',
      isMe: false,
    },
  ]);

  const [inputText, setInputText] = useState('');

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newMsg: ChatMessage = {
      id: `m-${Date.now()}`,
      senderId: 'me',
      text: inputText.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMe: true,
    };

    setMessages(prev => [...prev, newMsg]);
    setInputText('');

    // Simulate realistic instant typing reply after 1s
    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        {
          id: `m-reply-${Date.now()}`,
          senderId: activeContact.id,
          text: `Acknowledged! Updating the dispatch log now.`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isMe: false,
        },
      ]);
    }, 1200);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Chat Messenger"
        subtitle="Direct staff communication, cross-department channels, and notifications."
        breadcrumbs={[{ label: 'Apps' }, { label: 'Chat' }]}
      />

      <div className="h-[620px] rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden grid grid-cols-1 md:grid-cols-12 shadow-xs">
        {/* Contacts Sidebar (4 cols) */}
        <div className="md:col-span-4 border-r border-slate-200 dark:border-slate-800 flex flex-col h-full bg-slate-50/50 dark:bg-slate-900/50">
          <div className="p-3 border-b border-slate-200 dark:border-slate-800">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search staff, channels..."
                className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
            {contacts.map(contact => {
              const isActive = contact.id === activeContact.id;
              return (
                <div
                  key={contact.id}
                  onClick={() => setActiveContact(contact)}
                  className={`p-3.5 flex items-start gap-3 cursor-pointer transition-colors ${
                    isActive
                      ? 'bg-indigo-50/80 dark:bg-indigo-950/40'
                      : 'hover:bg-slate-100/60 dark:hover:bg-slate-800/40'
                  }`}
                >
                  <div className="relative shrink-0">
                    <img
                      src={contact.avatar}
                      alt={contact.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    {contact.online && (
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-white dark:ring-slate-900" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h5 className="font-bold text-slate-900 dark:text-white text-xs truncate">
                        {contact.name}
                      </h5>
                      <span className="text-[10px] text-slate-400">{contact.lastTime}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">{contact.lastMessage}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chat Window (8 cols) */}
        <div className="md:col-span-8 flex flex-col h-full bg-white dark:bg-slate-900">
          {/* Chat Header */}
          <div className="p-3.5 px-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="relative">
                <img
                  src={activeContact.avatar}
                  alt={activeContact.name}
                  className="w-9 h-9 rounded-full object-cover"
                />
                {activeContact.online && (
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-white dark:ring-slate-900" />
                )}
              </div>
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-xs">
                  {activeContact.name}
                </h4>
                <span className="text-[10px] text-emerald-600 font-medium">
                  {activeContact.online ? 'Active now' : 'Offline'} • {activeContact.role}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1 text-slate-400">
              <button
                onClick={() => toast.info('Starting audio call...')}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700"
              >
                <Phone className="w-4 h-4" />
              </button>
              <button
                onClick={() => toast.info('Starting video conference...')}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700"
              >
                <Video className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.isMe ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-md px-4 py-2.5 rounded-2xl text-xs leading-relaxed ${
                    msg.isMe
                      ? 'bg-indigo-600 text-white rounded-br-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-bl-xs'
                  }`}
                >
                  {msg.text}
                </div>
                <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-1 px-1">
                  <span>{msg.time}</span>
                  {msg.isMe && <CheckCheck className="w-3 h-3 text-indigo-400" />}
                </div>
              </div>
            ))}
          </div>

          {/* Input Footer Form */}
          <form
            onSubmit={handleSendMessage}
            className="p-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2"
          >
            <button
              type="button"
              onClick={() => toast.info('Attachment picker opened')}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
            >
              <Paperclip className="w-4 h-4" />
            </button>
            <input
              type="text"
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              placeholder="Type message to team member..."
              className="flex-1 text-xs px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <Button type="submit" size="sm" leftIcon={<Send className="w-3.5 h-3.5" />}>
              Send
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};
