import type { ProposalTimelineStep } from '../../../lib/curatedProposal';

export function addTimelineStep(
  steps: ProposalTimelineStep[] | undefined,
  time: string,
  title: string,
  description: string
): ProposalTimelineStep[] {
  const step: ProposalTimelineStep = {
    id: `step-${Date.now()}`,
    time: time.trim() || '10:00',
    title: title.trim(),
    description: description.trim(),
  };
  return [...(steps || []), step];
}

export function updateTimelineStep(
  steps: ProposalTimelineStep[] | undefined,
  stepId: string,
  patch: Partial<ProposalTimelineStep>
): ProposalTimelineStep[] {
  return (steps || []).map((s) => (s.id === stepId ? { ...s, ...patch } : s));
}

export function deleteTimelineStep(
  steps: ProposalTimelineStep[] | undefined,
  stepId: string
): ProposalTimelineStep[] {
  return (steps || []).filter((s) => s.id !== stepId);
}

export function moveTimelineStep(
  steps: ProposalTimelineStep[] | undefined,
  idx: number,
  direction: 'up' | 'down'
): ProposalTimelineStep[] {
  const list = steps || [];
  const target = direction === 'up' ? idx - 1 : idx + 1;
  if (target < 0 || target >= list.length) return list;
  const copy = [...list];
  const [moved] = copy.splice(idx, 1);
  copy.splice(target, 0, moved);
  return copy;
}
