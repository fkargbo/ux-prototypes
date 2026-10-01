import React from 'react';

type AgenticRunDetailsShellProps = {
  children: React.ReactNode;
  /** Sticky viewport footer (execute/deny/download or cluster-update actions). */
  actions?: React.ReactNode;
};

/**
 * Flex shell so the action bar stays pinned to the viewport bottom while timeline content scrolls.
 */
export const AgenticRunDetailsShell: React.FC<AgenticRunDetailsShellProps> = ({ children, actions }) => (
  <div className="ols-agentic-run-details-shell">
    <div className="ols-agentic-run-details-shell__body">{children}</div>
    {actions ? (
      <footer
        className="ols-agentic-run-details-shell__actions"
        aria-label="Run actions"
      >
        <div className="ols-agentic-run-details-shell__actions-inner">{actions}</div>
      </footer>
    ) : null}
  </div>
);
