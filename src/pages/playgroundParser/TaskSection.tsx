import React from 'react';
import { BpmnTask } from '../../common/bpmnHandler/bpmnParser';

interface TaskSectionProps {
  title: string;
  tasks: BpmnTask[];
  color: 'green' | 'yellow';
  emptyIcon: string;
  emptyMessage: string;
  emptySubMessage: string;
  onNavigate: (taskId: string) => void;
}

const TaskSection: React.FC<TaskSectionProps> = ({
  title,
  tasks,
  color,
  emptyIcon,
  emptyMessage,
  emptySubMessage,
  onNavigate,
}) => {
  const styles =
    color === 'green'
      ? {
          bg: 'bg-green-50',
          border: 'border-green-200',
          hover: 'hover:bg-green-100',
          badge: 'bg-green-200 text-green-800',
          button: 'bg-green-600 hover:bg-green-700',
          indicator: 'bg-green-500',
        }
      : {
          bg: 'bg-yellow-50',
          border: 'border-yellow-200',
          hover: 'hover:bg-yellow-100',
          badge: 'bg-yellow-200 text-yellow-800',
          button: 'bg-yellow-600 hover:bg-yellow-700',
          indicator: 'bg-yellow-500',
        };

  return (
    <div className='bg-white rounded-lg shadow p-6'>
      <h2 className='text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2'>
        <span className={`w-3 h-3 ${styles.indicator} rounded-full`}></span>
        {title}
      </h2>
      {tasks.length > 0 ? (
        <div className='space-y-3'>
          {tasks.map((task) => (
            <div
              key={task.id}
              className={`p-4 ${styles.bg} rounded-lg border ${styles.border} ${styles.hover} transition-colors`}
            >
              <div className='flex items-center justify-between mb-2'>
                <h3 className='font-semibold text-gray-900'>
                  {task.name || task.id}
                </h3>
                <span className={`text-sm px-2 py-1 rounded ${styles.badge}`}>
                  {task.type}
                </span>
              </div>
              <div className='flex items-center justify-between'>
                <code className='text-sm bg-gray-100 px-2 py-1 rounded text-gray-600'>
                  {task.id}
                </code>
                <button
                  onClick={() => onNavigate(task.id)}
                  className={`${styles.button} text-white px-3 py-1 rounded-md transition-colors text-sm`}
                >
                  Navigate
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className='text-center py-8'>
          <div className='w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3'>
            <span className='text-gray-400 text-xl'>{emptyIcon}</span>
          </div>
          <p className='text-gray-500 text-sm'>{emptyMessage}</p>
          <p className='text-gray-400 text-xs mt-1'>{emptySubMessage}</p>
        </div>
      )}
    </div>
  );
};

export default TaskSection;
