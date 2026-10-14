import React, { useState } from 'react';
import { Plus, MoreHorizontal, ArrowRight, ArrowLeft, Clock, User, CheckSquare } from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { useToast } from '../../context/ToastContext';

interface KanbanTask {
  id: string;
  title: string;
  description: string;
  status: 'backlog' | 'todo' | 'in_progress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high';
  tag: string;
  assignee: { name: string; avatar: string };
  dueDate: string;
}

export const KanbanPage: React.FC = () => {
  const { toast } = useToast();

  const [tasks, setTasks] = useState<KanbanTask[]>([
    {
      id: 'task-1',
      title: 'Upgrade Tailwind CSS build pipeline',
      description: 'Optimize post-css bundle size and migrate legacy utility classes.',
      status: 'in_progress',
      priority: 'high',
      tag: 'Engineering',
      assignee: {
        name: 'Alexander Wright',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      },
      dueDate: 'Jun 12',
    },
    {
      id: 'task-2',
      title: 'Design high-converting checkout funnel',
      description: 'A/B test one-step payment layout with Apple Pay & Google Pay.',
      status: 'todo',
      priority: 'medium',
      tag: 'Design',
      assignee: {
        name: 'Sofia Chen',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      },
      dueDate: 'Jun 16',
    },
    {
      id: 'task-3',
      title: 'Integrate Laravel Sanctum API Tokens',
      description: 'Prepare frontend service interceptors for bearer authentication tokens.',
      status: 'done',
      priority: 'high',
      tag: 'Backend',
      assignee: {
        name: 'Marcus Vance',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      },
      dueDate: 'Jun 04',
    },
    {
      id: 'task-4',
      title: 'Automate weekly inventory audit notifications',
      description: 'Send Slack webhook alerts when SKU falls beneath min threshold.',
      status: 'backlog',
      priority: 'low',
      tag: 'Logistics',
      assignee: {
        name: 'Elena Rostova',
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      },
      dueDate: 'Jun 28',
    },
    {
      id: 'task-5',
      title: 'Security audit of customer billing addresses',
      description: 'Ensure PCI compliance and encryption on all stored checkout tokens.',
      status: 'review',
      priority: 'high',
      tag: 'Security',
      assignee: {
        name: 'David Kim',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      },
      dueDate: 'Jun 14',
    },
  ]);

  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskPriority, setTaskPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [targetColumn, setTargetColumn] = useState<KanbanTask['status']>('todo');

  const columns: { id: KanbanTask['status']; title: string; color: string }[] = [
    { id: 'backlog', title: 'Backlog', color: 'bg-slate-400' },
    { id: 'todo', title: 'To Do', color: 'bg-indigo-500' },
    { id: 'in_progress', title: 'In Progress', color: 'bg-amber-500' },
    { id: 'review', title: 'Review', color: 'bg-purple-500' },
    { id: 'done', title: 'Done', color: 'bg-emerald-500' },
  ];

  const moveTask = (taskId: string, direction: 'left' | 'right') => {
    const colOrder: KanbanTask['status'][] = ['backlog', 'todo', 'in_progress', 'review', 'done'];
    setTasks(prev =>
      prev.map(t => {
        if (t.id !== taskId) return t;
        const currIdx = colOrder.indexOf(t.status);
        const nextIdx = direction === 'right' ? Math.min(currIdx + 1, colOrder.length - 1) : Math.max(currIdx - 1, 0);
        return { ...t, status: colOrder[nextIdx] };
      })
    );
    toast.success('Task moved');
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    const newTask: KanbanTask = {
      id: `task-${Date.now()}`,
      title: taskTitle,
      description: taskDesc,
      status: targetColumn,
      priority: taskPriority,
      tag: 'Feature',
      assignee: {
        name: 'Alexander Wright',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      },
      dueDate: 'Jun 22',
    };

    setTasks([...tasks, newTask]);
    setIsNewModalOpen(false);
    setTaskTitle('');
    setTaskDesc('');
    toast.success('Task added to board');
  };

  const getPriorityBadge = (priority: KanbanTask['priority']) => {
    switch (priority) {
      case 'high':
        return <Badge variant="danger">High</Badge>;
      case 'medium':
        return <Badge variant="warning">Medium</Badge>;
      case 'low':
        return <Badge variant="neutral">Low</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Kanban Board"
        subtitle="Agile sprint workflows, feature pipelines, and engineering assignments."
        breadcrumbs={[{ label: 'Apps' }, { label: 'Kanban' }]}
        actions={
          <Button size="sm" onClick={() => setIsNewModalOpen(true)} leftIcon={<Plus className="w-3.5 h-3.5" />}>
            Add Task
          </Button>
        }
      />

      {/* Kanban Board Horizontal Scroll / Columns */}
      <div className="flex gap-4 overflow-x-auto pb-4 items-start min-h-[600px]">
        {columns.map(col => {
          const colTasks = tasks.filter(t => t.status === col.id);

          return (
            <div
              key={col.id}
              className="w-80 shrink-0 bg-slate-100/70 dark:bg-slate-900/60 rounded-2xl p-3 border border-slate-200/70 dark:border-slate-800 flex flex-col max-h-[calc(100vh-220px)]"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-3 px-1 border-b border-slate-200/60 dark:border-slate-800 shrink-0">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${col.color}`} />
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    {col.title}
                  </h4>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-white dark:bg-slate-800 text-slate-500 shadow-xs">
                    {colTasks.length}
                  </span>
                </div>
                <button
                  onClick={() => {
                    setTargetColumn(col.id);
                    setIsNewModalOpen(true);
                  }}
                  className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-white dark:hover:bg-slate-800"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Task Cards Container */}
              <div className="flex-1 overflow-y-auto space-y-3 pt-3 pr-1">
                {colTasks.map(task => (
                  <div
                    key={task.id}
                    className="p-3.5 rounded-xl bg-white dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 shadow-xs text-xs space-y-2.5 hover:shadow-md transition-shadow group"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold">
                        {task.tag}
                      </span>
                      {getPriorityBadge(task.priority)}
                    </div>

                    <h5 className="font-semibold text-slate-900 dark:text-slate-100 leading-snug">
                      {task.title}
                    </h5>
                    <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-2">
                      {task.description}
                    </p>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400">
                      <div className="flex items-center gap-2">
                        <img
                          src={task.assignee.avatar}
                          alt={task.assignee.name}
                          className="w-5 h-5 rounded-full object-cover"
                          title={task.assignee.name}
                        />
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {task.dueDate}
                        </span>
                      </div>

                      {/* Move buttons */}
                      <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100">
                        {col.id !== 'backlog' && (
                          <button
                            onClick={() => moveTask(task.id, 'left')}
                            className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700"
                            title="Move Back"
                          >
                            <ArrowLeft className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {col.id !== 'done' && (
                          <button
                            onClick={() => moveTask(task.id, 'right')}
                            className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700"
                            title="Move Forward"
                          >
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Task Modal */}
      <Modal isOpen={isNewModalOpen} onClose={() => setIsNewModalOpen(false)} title="Add Kanban Task">
        <form onSubmit={handleCreateTask} className="space-y-4 text-xs">
          <Input
            label="Task Title *"
            value={taskTitle}
            onChange={e => setTaskTitle(e.target.value)}
            placeholder="e.g. Implement Webhook Dispatcher"
            required
          />
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Task Details
            </label>
            <textarea
              rows={3}
              value={taskDesc}
              onChange={e => setTaskDesc(e.target.value)}
              placeholder="Scope, requirements, or acceptance criteria..."
              className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Column
              </label>
              <select
                value={targetColumn}
                onChange={e => setTargetColumn(e.target.value as any)}
                className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
              >
                <option value="backlog">Backlog</option>
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="review">Review</option>
                <option value="done">Done</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Priority
              </label>
              <select
                value={taskPriority}
                onChange={e => setTaskPriority(e.target.value as any)}
                className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsNewModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm">
              Add Task
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
