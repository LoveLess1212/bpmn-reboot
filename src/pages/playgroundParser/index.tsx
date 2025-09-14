import React, { useState, useEffect } from 'react';
import BpmnParser, { BpmnTask } from '../../common/bpmnHandler/bpmnParser';

interface ParsedWorkflow {
  tasks: { [key: string]: BpmnTask };
  firstTask: BpmnTask | null;
}

const PlaygroundParser: React.FC = () => {
  const [bpmnXml, setBpmnXml] = useState<string>('');
  const [parsedWorkflow, setParsedWorkflow] = useState<ParsedWorkflow | null>(
    null
  );
  const [currentTask, setCurrentTask] = useState<BpmnTask | null>(null);
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [parserInstance, setParserInstance] = useState<BpmnParser | null>(null);

  // Parse BPMN XML function
  const parseBpmn = (xmlString: string) => {
    try {
      setIsLoading(true);
      setError('');

      // Basic XML validation
      if (!xmlString.trim()) {
        throw new Error('BPMN XML cannot be empty');
      }

      if (!xmlString.includes('bpmn2:definitions')) {
        throw new Error('Invalid BPMN XML: Missing bpmn2:definitions element');
      }

      const parser = new BpmnParser(xmlString);
      const firstTask = parser.getFirstTask();
      const allTasks = parser.getAllTasks();

      // Validation checks
      const taskCount = Object.keys(allTasks).length;
      if (taskCount === 0) {
        throw new Error('No tasks found in the workflow');
      }

      // Store parser instance for testing methods
      setParserInstance(parser);
      setParsedWorkflow({
        tasks: allTasks,
        firstTask,
      });

      setCurrentTask(firstTask);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(`Failed to parse BPMN: ${errorMessage}`);
      setParsedWorkflow(null);
      setCurrentTask(null);
      setParserInstance(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Navigate to specific task
  const navigateToTask = (taskId: string) => {
    if (!parsedWorkflow) return;

    const task = parsedWorkflow.tasks[taskId];
    if (task) {
      setCurrentTask(task);
    }
  };

  // Get next tasks for current task
  const getNextTasks = (): BpmnTask[] => {
    if (!currentTask || !parserInstance) return [];
    return parserInstance.getNextTasks(currentTask.id);
  };

  // Get previous tasks for current task
  const getPreviousTasks = (): BpmnTask[] => {
    if (!currentTask || !parserInstance) return [];
    return parserInstance.getPreviousTasks(currentTask.id);
  };

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
            onClick={() => {
              setBpmnXml('');
              setParsedWorkflow(null);
              setCurrentTask(null);
              setError('');
            }}
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
              <div className='bg-white rounded-lg shadow p-6'>
                <h2 className='text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2'>
                  <span className='w-3 h-3 bg-yellow-500 rounded-full'></span>
                  Previous Tasks ({getPreviousTasks().length})
                </h2>
                {getPreviousTasks().length > 0 ? (
                  <div className='space-y-3'>
                    {getPreviousTasks().map((task) => (
                      <div
                        key={task.id}
                        className='p-4 bg-yellow-50 rounded-lg border border-yellow-200 hover:bg-yellow-100 transition-colors'
                      >
                        <div className='flex items-center justify-between mb-2'>
                          <h3 className='font-semibold text-gray-900'>
                            {task.name || task.id}
                          </h3>
                          <span className='text-sm px-2 py-1 bg-yellow-200 text-yellow-800 rounded'>
                            {task.type}
                          </span>
                        </div>
                        <div className='flex items-center justify-between'>
                          <code className='text-sm bg-gray-100 px-2 py-1 rounded text-gray-600'>
                            {task.id}
                          </code>
                          <button
                            onClick={() => navigateToTask(task.id)}
                            className='bg-yellow-600 text-white px-3 py-1 rounded-md hover:bg-yellow-700 transition-colors text-sm'
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
                      <span className='text-gray-400 text-xl'>←</span>
                    </div>
                    <p className='text-gray-500 text-sm'>
                      No previous tasks found
                    </p>
                    <p className='text-gray-400 text-xs mt-1'>
                      This might be the first task in the workflow
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Next Tasks Section */}
            {currentTask && (
              <div className='bg-white rounded-lg shadow p-6'>
                <h2 className='text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2'>
                  <span className='w-3 h-3 bg-green-500 rounded-full'></span>
                  Next Tasks ({getNextTasks().length})
                </h2>
                {getNextTasks().length > 0 ? (
                  <div className='space-y-3'>
                    {getNextTasks().map((task) => (
                      <div
                        key={task.id}
                        className='p-4 bg-green-50 rounded-lg border border-green-200 hover:bg-green-100 transition-colors'
                      >
                        <div className='flex items-center justify-between mb-2'>
                          <h3 className='font-semibold text-gray-900'>
                            {task.name || task.id}
                          </h3>
                          <span className='text-sm px-2 py-1 bg-green-200 text-green-800 rounded'>
                            {task.type}
                          </span>
                        </div>
                        <div className='flex items-center justify-between'>
                          <code className='text-sm bg-gray-100 px-2 py-1 rounded text-gray-600'>
                            {task.id}
                          </code>
                          <button
                            onClick={() => navigateToTask(task.id)}
                            className='bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-700 transition-colors text-sm'
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
                      <span className='text-gray-400 text-xl'>→</span>
                    </div>
                    <p className='text-gray-500 text-sm'>No next tasks found</p>
                    <p className='text-gray-400 text-xs mt-1'>
                      This might be the final task in the workflow
                    </p>
                  </div>
                )}
              </div>
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
                          {getPreviousTasks().length > 0 ? (
                            <div className='space-y-2'>
                              {getPreviousTasks().map((task, index) => (
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
                          {getNextTasks().length > 0 ? (
                            <div className='space-y-2'>
                              {getNextTasks().map((task, index) => (
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
