import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import styled from '@emotion/styled';
import { toast } from 'react-toastify';

import colors from 'client/styles/colors';
import {
  compareBaselineSnapshots,
  createBaselineSnapshot,
  readBaseline,
  removeBaseline,
  writeBaseline,
  type BaselineChange,
  type BaselineSnapshot,
  type ChangeKind,
} from 'client/utils/baseline';

interface Props {
  target: string;
  currentResults: Record<string, unknown>;
  settled: boolean;
  titles: Record<string, string>;
}

const Panel = styled(motion.section)`
  width: var(--page-width);
  margin: 0 auto;
  padding: clamp(1.2rem, 2vw, 2rem);
  border: 1px solid color-mix(in srgb, ${colors.primary} 24%, transparent);
  border-radius: 1.25rem;
  background:
    linear-gradient(145deg, rgba(255, 255, 255, 0.045), rgba(255, 255, 255, 0.012)),
    color-mix(in srgb, ${colors.backgroundLighter} 84%, transparent);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.05),
    0 24px 80px rgba(0, 0, 0, 0.24);
  backdrop-filter: blur(18px);
  overflow: hidden;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    width: 18rem;
    height: 18rem;
    right: -10rem;
    top: -12rem;
    border-radius: 50%;
    background: ${colors.primary};
    opacity: 0.08;
    filter: blur(48px);
    pointer-events: none;
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 1rem 2rem;
  position: relative;

  .eyebrow {
    margin: 0 0 0.55rem;
    color: ${colors.primary};
    font-size: 0.72rem;
    font-weight: 700;
    letter-spacing: 0.16em;
    text-transform: uppercase;
  }

  h2 {
    margin: 0;
    font-size: clamp(1.35rem, 3vw, 2rem);
    letter-spacing: -0.025em;
  }

  .meta {
    margin: 0.55rem 0 0;
    color: ${colors.textColorSecondary};
    line-height: 1.55;
    max-width: 45rem;
  }
`;

const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.65rem;
`;

const Button = styled.button<{ variant?: 'primary' | 'quiet' }>`
  border: 1px solid
    ${(props) => (props.variant === 'primary' ? colors.primary : colors.primaryTransparent)};
  border-radius: 999px;
  padding: 0.72rem 1rem;
  background: ${(props) => (props.variant === 'primary' ? colors.primary : 'rgba(255,255,255,.025)')};
  color: ${(props) => (props.variant === 'primary' ? colors.background : colors.textColor)};
  font-weight: 700;
  cursor: pointer;
  transition:
    transform 160ms ease,
    border-color 160ms ease,
    background 160ms ease;

  &:hover:not(:disabled),
  &:focus-visible:not(:disabled) {
    transform: translateY(-1px);
    border-color: ${colors.primary};
    outline: none;
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.46;
  }
`;

const Status = styled.div`
  display: flex;
  align-items: center;
  gap: 0.6rem;
  margin-top: 1.3rem;
  padding: 0.85rem 1rem;
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: 0.85rem;
  background: rgba(0, 0, 0, 0.14);
  color: ${colors.textColorSecondary};
  line-height: 1.45;

  .dot {
    width: 0.55rem;
    height: 0.55rem;
    flex: none;
    border-radius: 50%;
    background: ${colors.primary};
    box-shadow: 0 0 16px color-mix(in srgb, ${colors.primary} 70%, transparent);
  }
`;

const Summary = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.7rem;
  margin-top: 1.2rem;

  @media (max-width: 700px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`;

const SummaryItem = styled.div<{ tone: string }>`
  padding: 0.8rem 0.9rem;
  border: 1px solid color-mix(in srgb, ${(props) => props.tone} 22%, transparent);
  border-radius: 0.85rem;
  background: color-mix(in srgb, ${(props) => props.tone} 6%, transparent);

  strong {
    display: block;
    font-size: 1.35rem;
    color: ${(props) => props.tone};
  }

  span {
    display: block;
    margin-top: 0.15rem;
    color: ${colors.textColorSecondary};
    font-size: 0.75rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }
`;

const Groups = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.85rem;
  margin-top: 0.85rem;

  @media (max-width: 850px) {
    grid-template-columns: 1fr;
  }
`;

const Group = styled.details<{ tone: string }>`
  border: 1px solid rgba(255, 255, 255, 0.075);
  border-radius: 0.9rem;
  background: rgba(0, 0, 0, 0.13);
  overflow: hidden;

  summary {
    display: flex;
    align-items: center;
    gap: 0.55rem;
    padding: 0.85rem 1rem;
    cursor: pointer;
    font-weight: 700;
    list-style: none;
  }

  summary::-webkit-details-marker {
    display: none;
  }

  summary::before {
    content: '';
    width: 0.48rem;
    height: 0.48rem;
    border-radius: 50%;
    background: ${(props) => props.tone};
  }

  summary::after {
    content: '+';
    margin-left: auto;
    color: ${colors.textColorSecondary};
    font-size: 1.1rem;
  }

  &[open] summary::after {
    content: '−';
  }

  ul {
    max-height: 24rem;
    overflow: auto;
    margin: 0;
    padding: 0 1rem 1rem;
    list-style: none;
  }

  li {
    padding: 0.7rem 0;
    border-top: 1px solid rgba(255, 255, 255, 0.055);
  }

  .check {
    color: ${colors.textColor};
    font-weight: 650;
  }

  code {
    display: block;
    margin-top: 0.25rem;
    color: ${colors.textColorSecondary};
    font-size: 0.78rem;
    line-height: 1.45;
    white-space: pre-wrap;
    overflow-wrap: anywhere;
  }

  .before {
    color: ${colors.danger};
  }

  .after {
    color: ${colors.success};
  }
`;

const GROUP_META: Record<ChangeKind, { label: string; tone: string }> = {
  changed: { label: 'Changed', tone: colors.warning },
  added: { label: 'Added', tone: colors.success },
  removed: { label: 'Removed', tone: colors.danger },
  unchanged: { label: 'Unchanged', tone: colors.info },
};

const displayValue = (value: unknown): string => {
  if (value === undefined) return '—';
  if (typeof value === 'string') return value.length > 220 ? `${value.slice(0, 217)}…` : value;
  const serialized = JSON.stringify(value);
  if (!serialized) return String(value);
  return serialized.length > 220 ? `${serialized.slice(0, 217)}…` : serialized;
};

const ChangeRow = ({ change, title }: { change: BaselineChange; title: string }) => (
  <li>
    <div className="check">{title}</div>
    <code>{change.path || change.checkId}</code>
    {change.kind === 'changed' && (
      <code className="before">Before: {displayValue(change.before)}</code>
    )}
    {change.kind === 'changed' && (
      <code className="after">After: {displayValue(change.after)}</code>
    )}
    {change.kind === 'added' && <code className="after">{displayValue(change.after)}</code>}
    {change.kind === 'removed' && <code className="before">{displayValue(change.before)}</code>}
  </li>
);

const BaselinePanel = ({ target, currentResults, settled, titles }: Props): JSX.Element => {
  const [baseline, setBaseline] = useState<BaselineSnapshot | null>(null);
  const [storageReady, setStorageReady] = useState(false);
  const reducedMotion = useReducedMotion();
  const current = useMemo(
    () => createBaselineSnapshot(target, currentResults),
    [target, currentResults],
  );
  const hasCurrentData = Object.keys(currentResults).length > 0;

  useEffect(() => {
    try {
      setBaseline(readBaseline(target));
    } catch {
      toast.error('The saved baseline could not be read in this browser.');
    } finally {
      setStorageReady(true);
    }
  }, [target]);

  const comparison = useMemo(
    () => (baseline && settled ? compareBaselineSnapshots(baseline, current) : null),
    [baseline, current, settled],
  );

  const save = () => {
    try {
      const next = createBaselineSnapshot(target, currentResults);
      writeBaseline(next);
      setBaseline(next);
      toast.success(baseline ? 'Baseline updated.' : 'Baseline saved locally.');
    } catch {
      toast.error('Website Security Scanner could not save a baseline in this browser.');
    }
  };

  const reset = () => {
    try {
      removeBaseline(target);
      setBaseline(null);
      toast.info('Baseline reset.');
    } catch {
      toast.error('Website Security Scanner could not reset the baseline.');
    }
  };

  const kinds: ChangeKind[] = ['changed', 'added', 'removed', 'unchanged'];

  return (
    <Panel
      initial={reducedMotion ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.42, ease: 'easeOut' }}
    >
      <Header>
        <div>
          <p className="eyebrow">Local change intelligence</p>
          <h2>Changes Since Baseline</h2>
          <p className="meta">
            Save this scan in your browser, then compare future scans of {target}. Nothing leaves
            this device and no account is required.
          </p>
        </div>
        <Actions>
          <Button
            type="button"
            variant="primary"
            disabled={!settled || !hasCurrentData}
            onClick={save}
          >
            {baseline ? 'Update Baseline' : 'Save as Baseline'}
          </Button>
          {baseline && (
            <Button type="button" variant="quiet" onClick={reset}>
              Reset Baseline
            </Button>
          )}
        </Actions>
      </Header>

      {!settled && (
        <Status>
          <span className="dot" /> Waiting for the current scan to settle before comparison.
        </Status>
      )}
      {settled && storageReady && !baseline && (
        <Status>
          <span className="dot" /> No baseline is saved for this target yet.
        </Status>
      )}
      {baseline && (
        <Status>
          <span className="dot" /> Baseline saved {new Date(baseline.savedAt).toLocaleString()}.
        </Status>
      )}

      <AnimatePresence>
        {comparison && (
          <motion.div
            initial={reducedMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Summary>
              {kinds.map((kind) => (
                <SummaryItem key={kind} tone={GROUP_META[kind].tone}>
                  <strong>{comparison[kind].length}</strong>
                  <span>{GROUP_META[kind].label}</span>
                </SummaryItem>
              ))}
            </Summary>
            <Groups>
              {kinds.map((kind) => (
                <Group key={kind} tone={GROUP_META[kind].tone} open={kind === 'changed'}>
                  <summary>
                    {GROUP_META[kind].label} · {comparison[kind].length}
                  </summary>
                  <ul>
                    {comparison[kind].length ? (
                      comparison[kind].map((change, index) => (
                        <ChangeRow
                          key={`${change.checkId}-${change.path}-${index}`}
                          change={change}
                          title={titles[change.checkId] || change.checkId}
                        />
                      ))
                    ) : (
                      <li>No {GROUP_META[kind].label.toLowerCase()} values.</li>
                    )}
                  </ul>
                </Group>
              ))}
            </Groups>
          </motion.div>
        )}
      </AnimatePresence>
    </Panel>
  );
};

export default BaselinePanel;
