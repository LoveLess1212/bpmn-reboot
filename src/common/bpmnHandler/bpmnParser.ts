import { XMLParser } from 'fast-xml-parser';

export interface BpmnTask {
  id: string;
  type: string;
  name?: string;
  previousTasks: string[];
  nextTasks: string[];
}

export interface BpmnElement {
  id: string;
  type: string;
  name?: string;
  outgoing?: string[];
}

class BpmnParser {
  private xmlData: any;
  private tasks: { [key: string]: BpmnTask } = {};
  private allElements: { [key: string]: BpmnElement } = {}; // Keep all elements for traversal
  private firstTaskId: string | null = null;

  constructor(xmlString: string) {
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
      parseAttributeValue: true,
    });
    this.xmlData = parser.parse(xmlString);
    this.parseElements();
    this.buildTaskRelationships();
  }

  private parseElements() {
    // console.log('Parsing BPMN elements...');
    const definitions = this.xmlData['bpmn2:definitions'];
    if (!definitions) {
      console.error('No bpmn2:definitions found in the XML');
      return;
    }

    const choreography =
      definitions['bpmn2:choreography'] || definitions['bpmn2:process'];
    if (!choreography) {
      console.error('No bpmn2:choreography or bpmn2:process found in the XML');
      return;
    }

    // Parse ALL elements first (including gateways, events, etc.)
    const allElementTypes = [
      'bpmn2:startEvent',
      'bpmn2:endEvent',
      'bpmn2:task',
      'bpmn2:exclusiveGateway',
      'bpmn2:choreographyTask',
    ];

    allElementTypes.forEach((type) => {
      const elements = choreography[type];
      if (elements) {
        const elementArray = Array.isArray(elements) ? elements : [elements];
        elementArray.forEach((element: any) =>
          this.parseElement(element, type)
        );
      }
    });

    // Parse sequence flows to build outgoing connections
    const sequenceFlows = choreography['bpmn2:sequenceFlow'];
    if (sequenceFlows) {
      const flowArray = Array.isArray(sequenceFlows)
        ? sequenceFlows
        : [sequenceFlows];
      flowArray.forEach((flow: any) => this.parseSequenceFlow(flow));
    }

    // Extract tasks into separate collection
    this.extractTasks();

    // console.log('Parsed all elements:', this.allElements);
    // console.log('Parsed tasks:', this.tasks);
  }

  private parseElement(element: any, type: string) {
    const id = element['@_id'];
    const name = element['@_name'];
    const parsedType = type.replace('bpmn2:', '');

    this.allElements[id] = { id, type: parsedType, name, outgoing: [] };

    // console.log(`Parsed ${parsedType}:`, this.allElements[id]);
  }

  private parseSequenceFlow(flow: any) {
    const sourceRef = flow['@_sourceRef'];
    const targetRef = flow['@_targetRef'];
    if (this.allElements[sourceRef]) {
      this.allElements[sourceRef].outgoing!.push(targetRef);
    }
    // console.log(`Parsed sequence flow: ${sourceRef} -> ${targetRef}`);
  }

  private extractTasks() {
    // Extract only tasks from all elements
    for (const elementId in this.allElements) {
      const element = this.allElements[elementId];
      if (element.type === 'task' || element.type === 'choreographyTask') {
        this.tasks[elementId] = {
          id: element.id,
          type: element.type,
          name: element.name,
          previousTasks: [],
          nextTasks: [],
        };
      }
    }
  }

  private buildTaskRelationships() {
    // Build task-to-task relationships by traversing through gateways and events
    for (const taskId in this.tasks) {
      const nextTasks = this.findNextTasks(taskId);
      this.tasks[taskId].nextTasks = nextTasks;

      // Build reverse relationships (previous tasks)
      nextTasks.forEach((nextTaskId) => {
        if (this.tasks[nextTaskId]) {
          this.tasks[nextTaskId].previousTasks.push(taskId);
        }
      });
    }

    // Find the first task
    this.findFirstTask();
  }

  private findNextTasks(startElementId: string): string[] {
    const nextTasks: string[] = [];
    const visited = new Set<string>();
    const queue = [startElementId];

    while (queue.length > 0) {
      const currentElementId = queue.shift()!;
      if (visited.has(currentElementId)) continue;
      visited.add(currentElementId);

      const currentElement = this.allElements[currentElementId];
      if (!currentElement || !currentElement.outgoing) continue;

      // Process all outgoing connections
      for (const nextElementId of currentElement.outgoing) {
        if (visited.has(nextElementId)) continue;

        const nextElement = this.allElements[nextElementId];
        if (!nextElement) continue;

        // If it's a task, add it to results (but don't traverse further from it)
        if (
          (nextElement.type === 'task' ||
            nextElement.type === 'choreographyTask') &&
          !nextTasks.includes(nextElementId)
        ) {
          nextTasks.push(nextElementId);
        } else {
          // If it's not a task (gateway, event), continue traversing
          queue.push(nextElementId);
        }
      }
    }

    return nextTasks;
  }

  private findFirstTask() {
    // Find start event and traverse to first task
    let startEventId: string | null = null;
    for (const id in this.allElements) {
      if (this.allElements[id].type === 'startEvent') {
        startEventId = id;
        break;
      }
    }

    if (startEventId) {
      const firstTasks = this.findNextTasks(startEventId);
      if (firstTasks.length > 0) {
        this.firstTaskId = firstTasks[0];
      }
    }

    // Fallback: find task with no previous tasks
    if (!this.firstTaskId) {
      for (const taskId in this.tasks) {
        if (this.tasks[taskId].previousTasks.length === 0) {
          this.firstTaskId = taskId;
          break;
        }
      }
    }
  }

  public getFirstTask(): BpmnTask | null {
    return this.firstTaskId ? this.tasks[this.firstTaskId] : null;
  }

  public getNextTasks(currentTaskId: string): BpmnTask[] {
    const currentTask = this.tasks[currentTaskId];
    if (
      !currentTask ||
      !currentTask.nextTasks ||
      currentTask.nextTasks.length === 0
    ) {
      return [];
    }
    return currentTask.nextTasks.map((id) => this.tasks[id]).filter(Boolean);
  }

  public getPreviousTasks(currentTaskId: string): BpmnTask[] {
    const currentTask = this.tasks[currentTaskId];
    if (
      !currentTask ||
      !currentTask.previousTasks ||
      currentTask.previousTasks.length === 0
    ) {
      return [];
    }
    return currentTask.previousTasks
      .map((id) => this.tasks[id])
      .filter(Boolean);
  }

  public getTask(id: string): BpmnTask | null {
    return this.tasks[id] || null;
  }

  public getAllTasks(): { [key: string]: BpmnTask } {
    return this.tasks;
  }

  public getAllElements(): { [key: string]: BpmnElement } {
    return this.allElements;
  }

  // For debugging: get next elements (original functionality)
  public getNextElements(currentElementId: string): BpmnElement[] {
    const currentElement = this.allElements[currentElementId];
    if (
      !currentElement ||
      !currentElement.outgoing ||
      currentElement.outgoing.length === 0
    ) {
      return [];
    }
    return currentElement.outgoing
      .map((id: string) => this.allElements[id])
      .filter(Boolean);
  }

  public getElement(id: string): BpmnElement | null {
    return this.allElements[id] || null;
  }
}

export default BpmnParser;
