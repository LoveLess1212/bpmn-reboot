import { readFileSync } from 'node:fs';
import path from 'node:path';
import BpmnParser from './bpmnParser';

const bpmnPath = path.join(__dirname, 'bpmn1.bpmn');
const bpmnXml = readFileSync(bpmnPath, 'utf8');
const parser = new BpmnParser(bpmnXml);

describe('BpmnParser', () => {
  it('finds the start element', () => {
    const start = parser.getStartElement();
    expect(start).toBeTruthy();
    expect(start?.id).toBe('Event_0ij5je1');
  });

  it('gets next elements for given nodes', () => {
    const start = parser.getStartElement();
    const next = parser.getNextElements(start!.id);
    expect(next).toHaveLength(1);
    expect(next[0].id).toBe('ChoreographyTask_1sngxle');

    const gatewayNext = parser.getNextElements('Gateway_1j5huc2');
    const ids = gatewayNext.map(e => e.id).sort();
    expect(ids).toEqual(['ChoreographyTask_1gfr7u5', 'Event_0pnuwiq'].sort());
  });
});
