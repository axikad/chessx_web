import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Users,
} from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { useToast } from '../../context/ToastContext';

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  category: 'meeting' | 'release' | 'review' | 'marketing';
  attendees: number;
}

export const CalendarPage: React.FC = () => {
  const { toast } = useToast();
  const [currentMonth, setCurrentMonth] = useState('June 2026');
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventDate, setNewEventDate] = useState('2026-06-15');
  const [newEventCategory, setNewEventCategory] = useState<'meeting' | 'release' | 'review'>('meeting');

  const [events, setEvents] = useState<CalendarEvent[]>([
    { id: '1', title: 'Q2 Financial Executive Review', date: '2026-06-05', time: '10:00 AM', category: 'meeting', attendees: 8 },
    { id: '2', title: 'Storefront v2.4 Release Deploy', date: '2026-06-12', time: '02:00 PM', category: 'release', attendees: 4 },
    { id: '3', title: 'Enterprise Supplier Sync', date: '2026-06-18', time: '11:30 AM', category: 'review', attendees: 5 },
    { id: '4', title: 'Summer Promotion Campaign Launch', date: '2026-06-24', time: '09:00 AM', category: 'marketing', attendees: 12 },
  ]);

  const daysInMonth = Array.from({ length: 30 }, (_, i) => i + 1);

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'meeting': return 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 border-indigo-200';
      case 'release': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-200';
      case 'review': return 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border-amber-200';
      case 'marketing': return 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300 border-purple-200';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventTitle.trim()) return;

    const newEv: CalendarEvent = {
      id: Date.now().toString(),
      title: newEventTitle,
      date: newEventDate,
      time: '09:00 AM',
      category: newEventCategory,
      attendees: 3,
    };

    setEvents([...events, newEv]);
    setIsEventModalOpen(false);
    setNewEventTitle('');
    toast.success('Calendar event scheduled');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Calendar & Scheduling"
        subtitle="Operational timeline, team meetings, release dates, and scheduled events."
        breadcrumbs={[{ label: 'Apps' }, { label: 'Calendar' }]}
        actions={
          <Button size="sm" onClick={() => setIsEventModalOpen(true)} leftIcon={<Plus className="w-3.5 h-3.5" />}>
            New Event
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left (3 cols): Upcoming Events sidebar */}
        <div className="lg:col-span-4 space-y-4">
          <Card>
            <CardHeader title="Upcoming Events" description="Scheduled for this month" />
            <CardBody className="space-y-3">
              {events.map(ev => (
                <div
                  key={ev.id}
                  className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-xs space-y-1.5"
                >
                  <div className="flex justify-between items-start">
                    <span className="font-semibold text-slate-900 dark:text-white leading-snug">
                      {ev.title}
                    </span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium border ${getCategoryColor(ev.category)}`}>
                      {ev.category}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-500 text-[11px]">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {ev.time}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {ev.attendees} attendees
                    </span>
                  </div>
                </div>
              ))}
            </CardBody>
          </Card>
        </div>

        {/* Right (8 cols): Calendar Grid View */}
        <div className="lg:col-span-8">
          <Card>
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h3 className="font-bold text-slate-900 dark:text-white text-base">{currentMonth}</h3>
                <div className="flex items-center gap-1">
                  <button className="p-1 rounded text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800">
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button className="p-1 rounded text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs">
                {(['month', 'week', 'day'] as const).map(mode => (
                  <button
                    key={mode}
                    onClick={() => setViewMode(mode)}
                    className={`px-3 py-1 rounded-md capitalize transition-colors ${
                      viewMode === mode
                        ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 font-semibold shadow-xs'
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            {/* Calendar Days Header */}
            <div className="grid grid-cols-7 border-b border-slate-100 dark:border-slate-800 text-center py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              <span>Sun</span>
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
            </div>

            {/* Days Cells Grid */}
            <div className="grid grid-cols-7 divide-x divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {daysInMonth.map(day => {
                const dayStr = `2026-06-${day.toString().padStart(2, '0')}`;
                const dayEvents = events.filter(e => e.date === dayStr);

                return (
                  <div
                    key={day}
                    className="min-h-24 p-2 transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-800/30 flex flex-col justify-between"
                  >
                    <span className="font-semibold text-slate-600 dark:text-slate-400 text-right block">
                      {day}
                    </span>
                    <div className="space-y-1 mt-1">
                      {dayEvents.map(ev => (
                        <div
                          key={ev.id}
                          className={`p-1 rounded text-[10px] font-medium truncate ${getCategoryColor(ev.category)}`}
                          title={ev.title}
                        >
                          {ev.title}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>

      {/* Add Event Modal */}
      <Modal isOpen={isEventModalOpen} onClose={() => setIsEventModalOpen(false)} title="Schedule Event">
        <form onSubmit={handleCreateEvent} className="space-y-4 text-xs">
          <Input
            label="Event Title *"
            value={newEventTitle}
            onChange={e => setNewEventTitle(e.target.value)}
            placeholder="e.g. Sprint Retrospective"
            required
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Date"
              type="date"
              value={newEventDate}
              onChange={e => setNewEventDate(e.target.value)}
            />
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Category</label>
              <select
                value={newEventCategory}
                onChange={e => setNewEventCategory(e.target.value as any)}
                className="w-full text-xs p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
              >
                <option value="meeting">Team Meeting</option>
                <option value="release">Deployment Release</option>
                <option value="review">Business Review</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsEventModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm">
              Schedule Event
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
