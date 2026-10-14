import React, { useState } from 'react';
import {
  Inbox,
  Star,
  Send,
  File,
  Trash2,
  Plus,
  Search,
  ArrowLeft,
  Reply,
  MoreVertical,
  Paperclip,
} from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { useToast } from '../../context/ToastContext';

interface EmailItem {
  id: string;
  sender: string;
  senderEmail: string;
  subject: string;
  snippet: string;
  body: string;
  folder: 'inbox' | 'starred' | 'sent' | 'drafts' | 'trash';
  starred: boolean;
  time: string;
  unread: boolean;
  tag?: string;
}

export const EmailPage: React.FC = () => {
  const { toast } = useToast();
  const [activeFolder, setActiveFolder] = useState<'inbox' | 'starred' | 'sent' | 'drafts' | 'trash'>('inbox');
  const [selectedEmail, setSelectedEmail] = useState<EmailItem | null>(null);
  const [composeOpen, setComposeOpen] = useState(false);
  const [composeTo, setComposeTo] = useState('');
  const [composeSubject, setComposeSubject] = useState('');
  const [composeBody, setComposeBody] = useState('');

  const [emails, setEmails] = useState<EmailItem[]>([
    {
      id: 'e1',
      sender: 'Stripe Billing System',
      senderEmail: 'receipts@stripe.com',
      subject: 'Payout scheduled: $14,280.50 transferred to bank',
      snippet: 'Your daily merchant automated payout has been dispatched to Silicon Valley Bank...',
      body: 'Hello Alexander,\n\nWe have transferred $14,280.50 to your account at Silicon Valley Bank (ending in 1123). Funds are expected to arrive within 1 business day.\n\nSummary of charges:\n- 48 Successful checkouts\n- 0 Refunds or chargebacks\n\nThanks,\nThe Stripe Team',
      folder: 'inbox',
      starred: true,
      time: '11:20 AM',
      unread: true,
      tag: 'Finance',
    },
    {
      id: 'e2',
      sender: 'DHL Global Forwarding',
      senderEmail: 'tracking@dhl.com',
      subject: 'Customs Clearance Confirmation #DHL-98240-US',
      snippet: 'Container shipment containing 200 units of curved displays has cleared San Francisco port...',
      body: 'Dear Apex Logistics Manager,\n\nShipment #DHL-98240-US has successfully completed inspection at the Port of Oakland. All duties and customs declarations are cleared.\n\nEstimated truck delivery to Reno Distribution Center is tomorrow morning at 09:00 PST.',
      folder: 'inbox',
      starred: false,
      time: '09:45 AM',
      unread: false,
      tag: 'Shipping',
    },
    {
      id: 'e3',
      sender: 'Marcus Vance',
      senderEmail: 'marcus@apexenterprises.io',
      subject: 'Laravel Sanctum API Middleware specs',
      snippet: 'Hey Alexander, please review the bearer token expiration settings and CORS config...',
      body: 'Hi Alexander,\n\nI have committed the latest token configuration in the backend staging branch. Let me know if you need specific refresh token rotation parameters.\n\nBest,\nMarcus',
      folder: 'inbox',
      starred: false,
      time: 'Yesterday',
      unread: false,
    },
  ]);

  const toggleStar = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEmails(prev =>
      prev.map(em => (em.id === id ? { ...em, starred: !em.starred } : em))
    );
  };

  const handleSendEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!composeTo.trim() || !composeSubject.trim()) return;

    const newEmail: EmailItem = {
      id: `e-${Date.now()}`,
      sender: 'Alexander Wright',
      senderEmail: 'alexander@apexenterprises.io',
      subject: composeSubject,
      snippet: composeBody.slice(0, 80),
      body: composeBody,
      folder: 'sent',
      starred: false,
      time: 'Just now',
      unread: false,
    };

    setEmails([newEmail, ...emails]);
    setComposeOpen(false);
    setComposeTo('');
    setComposeSubject('');
    setComposeBody('');
    toast.success('Email dispatched successfully');
  };

  const filteredEmails = emails.filter(em => {
    if (activeFolder === 'starred') return em.starred;
    return em.folder === activeFolder;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Email Inbox"
        subtitle="Corporate communications, customer messages, and supplier notifications."
        breadcrumbs={[{ label: 'Apps' }, { label: 'Email' }]}
        actions={
          <Button size="sm" onClick={() => setComposeOpen(true)} leftIcon={<Plus className="w-3.5 h-3.5" />}>
            Compose Mail
          </Button>
        }
      />

      <div className="h-[620px] rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden grid grid-cols-1 md:grid-cols-12 shadow-xs">
        {/* Navigation Folders (3 cols) */}
        <div className="md:col-span-3 border-r border-slate-200 dark:border-slate-800 p-3 flex flex-col justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <div className="space-y-1">
            {[
              { id: 'inbox', label: 'Inbox', icon: <Inbox className="w-4 h-4" />, count: emails.filter(e => e.folder === 'inbox' && e.unread).length },
              { id: 'starred', label: 'Starred', icon: <Star className="w-4 h-4" />, count: emails.filter(e => e.starred).length },
              { id: 'sent', label: 'Sent Mail', icon: <Send className="w-4 h-4" /> },
              { id: 'drafts', label: 'Drafts', icon: <File className="w-4 h-4" /> },
              { id: 'trash', label: 'Trash', icon: <Trash2 className="w-4 h-4" /> },
            ].map(f => (
              <button
                key={f.id}
                onClick={() => {
                  setActiveFolder(f.id as any);
                  setSelectedEmail(null);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                  activeFolder === f.id
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  {f.icon}
                  <span>{f.label}</span>
                </div>
                {f.count !== undefined && f.count > 0 && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-indigo-600 text-white font-bold">
                    {f.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="p-3 bg-white dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60 text-[11px] text-slate-500">
            <span className="font-semibold text-slate-900 dark:text-white block mb-1">Mailbox Storage</span>
            <div className="w-full bg-slate-100 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden mb-1">
              <div className="bg-indigo-600 h-full rounded-full w-1/4" />
            </div>
            <span>3.8 GB of 15 GB utilized</span>
          </div>
        </div>

        {/* Email List or Detail Window (9 cols) */}
        <div className="md:col-span-9 flex flex-col h-full">
          {selectedEmail ? (
            /* Email Detail View */
            <div className="flex flex-col h-full bg-white dark:bg-slate-900">
              <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <button
                  onClick={() => setSelectedEmail(null)}
                  className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-indigo-600"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to list
                </button>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toast.success('Moved to trash')}
                    className="p-1.5 rounded text-slate-400 hover:text-rose-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="p-6 flex-1 overflow-y-auto space-y-6">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {selectedEmail.subject}
                  </h3>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                    <div>
                      <span className="font-semibold text-slate-900 dark:text-white block">
                        {selectedEmail.sender}
                      </span>
                      <span className="text-slate-400">{selectedEmail.senderEmail}</span>
                    </div>
                    <span className="text-slate-400">{selectedEmail.time}</span>
                  </div>
                </div>

                <div className="text-xs text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed">
                  {selectedEmail.body}
                </div>

                <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setComposeTo(selectedEmail.senderEmail);
                      setComposeSubject(`Re: ${selectedEmail.subject}`);
                      setComposeOpen(true);
                    }}
                    leftIcon={<Reply className="w-3.5 h-3.5" />}
                  >
                    Reply
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            /* Email List View */
            <div className="flex flex-col h-full">
              <div className="divide-y divide-slate-100 dark:divide-slate-800 overflow-y-auto flex-1">
                {filteredEmails.map(email => (
                  <div
                    key={email.id}
                    onClick={() => {
                      setSelectedEmail(email);
                      setEmails(prev =>
                        prev.map(e => (e.id === email.id ? { ...e, unread: false } : e))
                      );
                    }}
                    className={`p-3.5 flex items-center justify-between gap-4 cursor-pointer transition-colors text-xs ${
                      email.unread
                        ? 'bg-indigo-50/30 dark:bg-indigo-950/20 font-semibold'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <button
                        onClick={e => toggleStar(email.id, e)}
                        className="text-slate-300 hover:text-amber-400 shrink-0"
                      >
                        <Star
                          className={`w-4 h-4 ${
                            email.starred ? 'text-amber-400 fill-amber-400' : ''
                          }`}
                        />
                      </button>
                      <span className="font-semibold text-slate-900 dark:text-white w-36 truncate shrink-0">
                        {email.sender}
                      </span>
                      <div className="truncate">
                        <span className="text-slate-800 dark:text-slate-200">{email.subject}</span>
                        <span className="text-slate-400 font-normal ml-2 truncate">
                          - {email.snippet}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {email.tag && <Badge variant="neutral">{email.tag}</Badge>}
                      <span className="text-[11px] text-slate-400">{email.time}</span>
                    </div>
                  </div>
                ))}

                {filteredEmails.length === 0 && (
                  <div className="p-12 text-center text-slate-400 text-xs">
                    No emails in this folder.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Compose Email Modal */}
      <Modal isOpen={composeOpen} onClose={() => setComposeOpen(false)} title="New Message">
        <form onSubmit={handleSendEmail} className="space-y-4 text-xs">
          <Input
            label="To *"
            type="email"
            value={composeTo}
            onChange={e => setComposeTo(e.target.value)}
            placeholder="recipient@company.com"
            required
          />
          <Input
            label="Subject *"
            value={composeSubject}
            onChange={e => setComposeSubject(e.target.value)}
            placeholder="Regarding enterprise order..."
            required
          />
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Message Body</label>
            <textarea
              rows={6}
              value={composeBody}
              onChange={e => setComposeBody(e.target.value)}
              placeholder="Write your email message..."
              className="w-full p-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setComposeOpen(false)}>
              Discard
            </Button>
            <Button type="submit" size="sm" leftIcon={<Send className="w-3.5 h-3.5" />}>
              Send
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
