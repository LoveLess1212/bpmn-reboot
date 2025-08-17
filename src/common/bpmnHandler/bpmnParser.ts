import { XMLParser } from 'fast-xml-parser';

export interface BpmnElement {
    id: string;
    type: string;
    name?: string;
    outgoing?: string[];
}

class BpmnParser {
    private xmlData: any;
    private elements: { [key: string]: BpmnElement } = {};
    private startEventId: string | null = null;

    constructor(xmlString: string) {
        const parser = new XMLParser({
            ignoreAttributes: false,
            attributeNamePrefix: '@_',
            parseAttributeValue: true,
        });
        this.xmlData = parser.parse(xmlString);
        this.parseElements();
    }

    private parseElements() {
        // console.log('Parsing BPMN elements...');
        const definitions = this.xmlData['bpmn2:definitions'];
        if (!definitions) {
            console.error('No bpmn2:definitions found in the XML');
            return;
        }

        const choreography = definitions['bpmn2:choreography'] || definitions['bpmn2:process'];
        if (!choreography) {
            console.error('No bpmn2:choreography or bpmn2:process found in the XML');
            return;
        }

        // console.log('Choreography:', choreography);

        const elementTypes = ['bpmn2:startEvent', 'bpmn2:endEvent', 'bpmn2:task', 'bpmn2:exclusiveGateway', 'bpmn2:choreographyTask'];

        elementTypes.forEach(type => {
            const elements = choreography[type];
            if (elements) {
                const elementArray = Array.isArray(elements) ? elements : [elements];
                elementArray.forEach((element: any) => this.parseElement(element, type));
            }
        });

        // Parse sequence flows
        const sequenceFlows = choreography['bpmn2:sequenceFlow'];
        if (sequenceFlows) {
            const flowArray = Array.isArray(sequenceFlows) ? sequenceFlows : [sequenceFlows];
            flowArray.forEach((flow: any) => this.parseSequenceFlow(flow));
        }

        // console.log('Parsed elements:', this.elements);
        // console.log('Start event ID:', this.startEventId);
    }

    private parseElement(element: any, type: string) {
        const id = element['@_id'];
        const name = element['@_name'];
        const parsedType = type.replace('bpmn2:', '');

        this.elements[id] = { id, type: parsedType, name, outgoing: [] };

        if (parsedType === 'startEvent') {
            this.startEventId = id;
        }

        // console.log(`Parsed ${parsedType}:`, this.elements[id]);
    }

    private parseSequenceFlow(flow: any) {
        const sourceRef = flow['@_sourceRef'];
        const targetRef = flow['@_targetRef'];
        if (this.elements[sourceRef]) {
            this.elements[sourceRef].outgoing!.push(targetRef);
        }
        // console.log(`Parsed sequence flow: ${sourceRef} -> ${targetRef}`);
    }

    public getStartElement(): BpmnElement | null {
        return this.startEventId ? this.elements[this.startEventId] : null;
    }

    public getNextElements(currentElementId: string): BpmnElement[] {
        const currentElement = this.elements[currentElementId];
        if (!currentElement || !currentElement.outgoing || currentElement.outgoing.length === 0) {
            return [];
        }
        return currentElement.outgoing.map(id => this.elements[id]).filter(Boolean);
    }

    public getElement(id: string): BpmnElement | null {
        return this.elements[id] || null;
    }
}

export default BpmnParser;