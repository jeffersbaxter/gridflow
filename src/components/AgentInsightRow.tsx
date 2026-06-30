import type { AgentInsight } from '../types';

const KIND_LABEL: Record<AgentInsight['kind'], string> = {
  risk: 'Risk flagged',
  automation: 'Automation ready',
  summary: 'Summary',
};

const KIND_ICON: Record<AgentInsight['kind'], string> = {
  risk: '!',
  automation: '⚡',
  summary: '✦',
};

interface Props {
  insight: AgentInsight;
  onAct: (insight: AgentInsight) => void;
}

export function AgentInsightRow({ insight, onAct }: Props) {
  return (
    <div className="insight" role="note" aria-label="Agent insight">
      <span className="insight__icon" aria-hidden="true">
        {KIND_ICON[insight.kind]}
      </span>
      <div className="insight__body">
        <div className="insight__kind">{KIND_LABEL[insight.kind]}</div>
        <p className="insight__msg">{insight.message}</p>
        <div className="insight__meta">
          <span>{Math.round(insight.confidence * 100)}% confidence</span>
          {insight.kind === 'automation' && (
            <button
              type="button"
              className="insight__btn"
              onClick={() => onAct(insight)}
            >
              Approve & automate
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
