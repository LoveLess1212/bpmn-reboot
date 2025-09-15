import React from 'react';
import TaskSection from './TaskSection';
import { useParserPlayground } from './useParserPlayground';

const PlaygroundParser: React.FC = () => {
  const {
    bpmnXml,
    setBpmnXml,
    parsedWorkflow,
    currentTask,
    error,
    isLoading,
    parseBpmn,
    navigateToTask,
    previousTasks,
    nextTasks,
    reset,
    parserInstance,
  } = useParserPlayground();

  return (
    <div className='min-h-screen bg-gray-50 p-6'>
      <div className='max-w-7xl mx-auto'>
        <div className='mb-8'>
          <h1 className='text-3xl font-bold text-gray-900 mb-2'>
            BPMN Parser Playground
          </h1>
          <p className='text-gray-600'>
            Test and explore BPMN XML parsing functionality. Paste your BPMN XML
            below to get started.
          </p>
        </div>

        {/* Action Buttons */}
        <div className='mb-6 flex gap-3'>
          <button
            onClick={() => parseBpmn(bpmnXml)}
            disabled={!bpmnXml.trim() || isLoading}
            className='bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50'
          >
            Parse BPMN
          </button>
          <button
            onClick={reset}
            className='bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700'
          >
            Clear All
          </button>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
          {/* Input Section */}
          <div className='space-y-6'>
            <div className='bg-white rounded-lg shadow p-6'>
              <h2 className='text-xl font-semibold text-gray-900 mb-4'>
                BPMN XML Input
              </h2>
              <textarea
                value={bpmnXml}
                onChange={(e) => setBpmnXml(e.target.value)}
                placeholder='Paste your BPMN XML here to start testing the parser...'
                className='w-full h-64 p-3 border border-gray-300 rounded-md font-mono text-sm resize-vertical'
                disabled={isLoading}
              />
            </div>

            {/* Success/Error Display */}
            {error && (
              <div className='bg-red-50 border border-red-200 rounded-lg p-4'>
                <h3 className='text-red-800 font-semibold mb-2'>
                  Parsing Error
                </h3>
                <p className='text-red-700 text-sm'>{error}</p>
              </div>
            )}

            {parsedWorkflow && !error && (
              <div className='bg-green-50 border border-green-200 rounded-lg p-4'>
                <h3 className='text-green-800 font-semibold mb-2'>
                  Parsing Successful!
                </h3>
                <p className='text-green-700 text-sm'>
                  Found {Object.keys(parsedWorkflow.tasks).length} tasks. Use
                  the navigation controls on the right to explore the workflow.
                </p>
              </div>
            )}
          </div>

          {/* Output Section */}
          <div className='space-y-6'>
            {/* Current Task */}
            {currentTask && (
              <div className='bg-white rounded-lg shadow p-6'>
                <h2 className='text-xl font-semibold text-gray-900 mb-4'>
                  Current Task
                </h2>
                <div className='space-y-3'>
                  <div className='flex items-center gap-2'>
                    <span className='font-medium text-gray-700'>ID:</span>
                    <code className='bg-gray-100 px-2 py-1 rounded text-sm'>
                      {currentTask.id}
                    </code>
                  </div>
                  <div className='flex items-center gap-2'>
                    <span className='font-medium text-gray-700'>Type:</span>
                    <span
                      className={`px-2 py-1 rounded text-sm font-medium ${
                        currentTask.type === 'task'
                          ? 'bg-blue-100 text-blue-800'
                          : currentTask.type === 'choreographyTask'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {currentTask.type}
                    </span>
                  </div>
                  {currentTask.name && (
                    <div className='flex items-start gap-2'>
                      <span className='font-medium text-gray-700'>Name:</span>
                      <span className='text-gray-900'>{currentTask.name}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Navigation */}
            {currentTask && (
              <div className='bg-white rounded-lg shadow p-6'>
                <h2 className='text-xl font-semibold text-gray-900 mb-4'>
                  Task Navigation
                </h2>
                <div className='space-y-4'>
                  {parsedWorkflow?.firstTask && (
                    <div>
                      <button
                        onClick={() =>
                          navigateToTask(parsedWorkflow.firstTask!.id)
                        }
                        className='bg-green-100 text-green-800 px-3 py-2 rounded-md hover:bg-green-200 transition-colors'
                      >
                        Go to First Task
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Previous Tasks Section */}
            {currentTask && (
              <TaskSection
                title={`Previous Tasks (${previousTasks.length})`}
                tasks={previousTasks}
                color='yellow'
                onNavigate={navigateToTask}
                emptyIcon='←'
                emptyMessage='No previous tasks found'
                emptySubMessage='This might be the first task in the workflow'
              />
            )}

            {/* Next Tasks Section */}
            {currentTask && (
              <TaskSection
                title={`Next Tasks (${nextTasks.length})`}
                tasks={nextTasks}
                color='green'
                onNavigate={navigateToTask}
                emptyIcon='→'
                emptyMessage='No next tasks found'
                emptySubMessage='This might be the final task in the workflow'
              />
            )}

            {/* All Tasks Overview */}
            {parsedWorkflow && (
              <div className='bg-white rounded-lg shadow p-6'>
                <h2 className='text-xl font-semibold text-gray-900 mb-4'>
                  All Tasks ({Object.keys(parsedWorkflow.tasks).length})
                </h2>
                <div className='space-y-2 max-h-64 overflow-y-auto'>
                  {Object.values(parsedWorkflow.tasks).map((task) => (
                    <button
                      key={task.id}
                      onClick={() => navigateToTask(task.id)}
                      className={`block w-full text-left p-2 rounded-md transition-colors ${
                        currentTask?.id === task.id
                          ? 'bg-blue-100 border-2 border-blue-300'
                          : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                      }`}
                    >
                      <div className='flex items-center justify-between'>
                        <span className='font-medium text-sm'>
                          {task.name || task.id}
                        </span>
                        <span className='text-xs text-gray-500'>
                          {task.type}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Parser Method Testing */}
            {parserInstance && (
              <div className='bg-white rounded-lg shadow p-6'>
                <h2 className='text-xl font-semibold text-gray-900 mb-4'>
                  Parser Methods
                </h2>
                <div className='space-y-4'>
                  <div>
                    <h3 className='font-medium text-gray-700 mb-2'>
                      getFirstTask()
                    </h3>
                    <div className='bg-gray-50 p-3 rounded-md'>
                      {parsedWorkflow?.firstTask ? (
                        <div className='text-sm'>
                          <div>
                            <strong>ID:</strong> {parsedWorkflow.firstTask.id}
                          </div>
                          <div>
                            <strong>Type:</strong>{' '}
                            {parsedWorkflow.firstTask.type}
                          </div>
                          {parsedWorkflow.firstTask.name && (
                            <div>
                              <strong>Name:</strong>{' '}
                              {parsedWorkflow.firstTask.name}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className='text-gray-500 text-sm'>
                          No first task found
                        </span>
                      )}
                    </div>
                  </div>

                  {currentTask && (
                    <>
                      <div>
                        <h3 className='font-medium text-gray-700 mb-2'>
                          getPreviousTasks("{currentTask.id}")
                        </h3>
                        <div className='bg-gray-50 p-3 rounded-md'>
                  {previousTasks.length > 0 ? (
                    <div className='space-y-2'>
                      {previousTasks.map((task, index) => (
                        <div key={task.id} className='text-sm'>
                          <strong>[{index}]:</strong> {task.id} (
                          {task.type}){task.name && ` - ${task.name}`}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className='text-gray-500 text-sm'>
                      No previous tasks
                    </span>
                  )}
                </div>
              </div>

              <div>
                <h3 className='font-medium text-gray-700 mb-2'>
                  getNextTasks("{currentTask.id}")
                </h3>
                <div className='bg-gray-50 p-3 rounded-md'>
                  {nextTasks.length > 0 ? (
                    <div className='space-y-2'>
                      {nextTasks.map((task, index) => (
                        <div key={task.id} className='text-sm'>
                          <strong>[{index}]:</strong> {task.id} (
                          {task.type}){task.name && ` - ${task.name}`}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className='text-gray-500 text-sm'>
                      No next tasks
                    </span>
                  )}
                </div>
              </div>

                      <div>
                        <h3 className='font-medium text-gray-700 mb-2'>
                          getTask("{currentTask.id}")
                        </h3>
                        <div className='bg-gray-50 p-3 rounded-md'>
                          <div className='text-sm'>
                            <div>
                              <strong>ID:</strong> {currentTask.id}
                            </div>
                            <div>
                              <strong>Type:</strong> {currentTask.type}
                            </div>
                            {currentTask.name && (
                              <div>
                                <strong>Name:</strong> {currentTask.name}
                              </div>
                            )}
                            <div>
                              <strong>Previous Tasks:</strong>{' '}
                              {currentTask.previousTasks?.length
                                ? `[${currentTask.previousTasks.join(', ')}]`
                                : 'None'}
                            </div>
                            <div>
                              <strong>Next Tasks:</strong>{' '}
                              {currentTask.nextTasks?.length
                                ? `[${currentTask.nextTasks.join(', ')}]`
                                : 'None'}
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Loading Overlay */}
        {isLoading && (
          <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
            <div className='bg-white rounded-lg p-6 flex items-center space-x-3'>
              <div className='animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600'></div>
              <span className='text-gray-900'>Processing BPMN...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlaygroundParser;
