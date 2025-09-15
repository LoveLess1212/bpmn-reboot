import { useState } from 'react';
import BpmnParser, { BpmnTask } from '../../common/bpmnHandler/bpmnParser';

interface ParsedWorkflow {
  tasks: { [key: string]: BpmnTask };
  firstTask: BpmnTask | null;
}

export const useParserPlayground = () => {
  const [bpmnXml, setBpmnXml] = useState<string>('');
  const [parsedWorkflow, setParsedWorkflow] = useState<ParsedWorkflow | null>(
    null
  );
  const [currentTask, setCurrentTask] = useState<BpmnTask | null>(null);
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [parserInstance, setParserInstance] = useState<BpmnParser | null>(
    null
  );

  const parseBpmn = (xmlString: string) => {
    try {
      setIsLoading(true);
      setError('');

      if (!xmlString.trim()) {
        throw new Error('BPMN XML cannot be empty');
      }

      if (!xmlString.includes('bpmn2:definitions')) {
        throw new Error('Invalid BPMN XML: Missing bpmn2:definitions element');
      }

      const parser = new BpmnParser(xmlString);
      const firstTask = parser.getFirstTask();
      const allTasks = parser.getAllTasks();

      const taskCount = Object.keys(allTasks).length;
      if (taskCount === 0) {
        throw new Error('No tasks found in the workflow');
      }

      setParserInstance(parser);
      setParsedWorkflow({ tasks: allTasks, firstTask });
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

  const navigateToTask = (taskId: string) => {
    if (!parsedWorkflow) return;
    const task = parsedWorkflow.tasks[taskId];
    if (task) {
      setCurrentTask(task);
    }
  };

  const previousTasks =
    currentTask && parserInstance
      ? parserInstance.getPreviousTasks(currentTask.id)
      : [];
  const nextTasks =
    currentTask && parserInstance
      ? parserInstance.getNextTasks(currentTask.id)
      : [];

  const reset = () => {
    setBpmnXml('');
    setParsedWorkflow(null);
    setCurrentTask(null);
    setError('');
    setParserInstance(null);
  };

  return {
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
    parserInstance,
    reset,
  };
};

export type { ParsedWorkflow };
