import React, { useId, useState } from 'react';
import {
  Button,
  ClipboardCopyButton,
  CodeBlock,
  CodeBlockAction,
  CodeBlockCode,
} from '@patternfly/react-core';
import { RhUiDownloadIcon } from '@patternfly/react-icons';

/** Default maximum lines shown in the collapsed state. */
const DEFAULT_MAX_COLLAPSED_LINES = 5;

export interface ExpandableCodeBlockProps {
  /**
   * The code / log string to display.
   * Copy-to-clipboard uses `clipboardCode` when set; otherwise copies `code`
   * (full string regardless of expand/collapse state).
   */
  code: string;
  /**
   * Optional full evidence string for Copy (e.g. unfiltered audit logs while
   * the viewport shows a search-/health-check-filtered subset).
   */
  clipboardCode?: string;
  /**
   * Stable base id used to generate the copy-button and code-element ids.
   * Auto-generated via React.useId() when omitted.
   */
  id?: string;
  /**
   * Extra inline styles forwarded to the `<CodeBlockCode>` element.
   * Typical uses: `{ fontSize: '12px' }` or `{ maxHeight: '280px', overflowY: 'auto' }`.
   */
  codeStyle?: React.CSSProperties;
  /**
   * Maximum number of lines to show before the "Show more" toggle appears.
   * Defaults to 5 per PatternFly CodeBlock design guidelines.
   */
  maxCollapsedLines?: number;
  /**
   * Optional extra actions rendered before the built-in download/copy buttons.
   * Use sparingly — the copy button is always included automatically.
   */
  extraActions?: React.ReactNode;
  /**
   * When provided, renders a "Download log file" action adjacent to Copy.
   * Caller supplies the click handler (typically a Blob download of full evidence).
   */
  onDownload?: () => void;
  /** Accessible label for the download action. Defaults to "Download log file". */
  downloadAriaLabel?: string;
}

/**
 * A self-contained, reusable PatternFly `<CodeBlock>` wrapper that:
 *  - Shows at most `maxCollapsedLines` (default 5) lines when the content is long.
 *  - Renders an inline "Show more / Show less" toggle below the code when needed.
 *  - Provides a built-in "Copy to clipboard" action button.
 *  - Manages its own copy-feedback and expand/collapse state internally.
 *
 * Usage:
 * ```tsx
 * <ExpandableCodeBlock
 *   id="my-command"
 *   code={rawCommandString}
 *   codeStyle={{ fontSize: '12px' }}
 * />
 * ```
 */
export const ExpandableCodeBlock: React.FC<ExpandableCodeBlockProps> = ({
  code,
  clipboardCode,
  id: idProp,
  codeStyle,
  maxCollapsedLines = DEFAULT_MAX_COLLAPSED_LINES,
  extraActions,
  onDownload,
  downloadAriaLabel = 'Download log file',
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  // React 18 useId() — stable across renders, unique per component instance.
  const reactId = useId();
  const baseId = idProp ?? reactId;
  const textId = `${baseId}-code`;
  const copyId = `${baseId}-copy`;
  const downloadId = `${baseId}-download`;

  const lines = code.trim().split('\n');
  const isLongCode = lines.length > maxCollapsedLines;
  const hiddenCount = lines.length - maxCollapsedLines;
  const displayedCode = isLongCode && !isExpanded
    ? lines.slice(0, maxCollapsedLines).join('\n')
    : code;

  const handleCopy = () => {
    navigator.clipboard.writeText(clipboardCode ?? code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <CodeBlock
      actions={
        <>
          {extraActions}
          {onDownload && (
            <CodeBlockAction>
              <Button
                id={downloadId}
                variant="plain"
                aria-label={downloadAriaLabel}
                onClick={onDownload}
                icon={<RhUiDownloadIcon />}
              />
            </CodeBlockAction>
          )}
          <CodeBlockAction>
            <ClipboardCopyButton
              id={copyId}
              textId={textId}
              aria-label="Copy to clipboard"
              onClick={handleCopy}
              exitDelay={1000}
              variant="plain"
            >
              {copied ? 'Copied!' : 'Copy'}
            </ClipboardCopyButton>
          </CodeBlockAction>
        </>
      }
    >
      <CodeBlockCode id={textId} style={codeStyle}>
        {displayedCode}
      </CodeBlockCode>
      {isLongCode && (
        <div style={{ marginTop: 'var(--pf-t--global--spacer--sm)' }}>
          <Button
            isInline
            variant="link"
            onClick={() => setIsExpanded((prev) => !prev)}
          >
            {isExpanded
              ? 'Show less'
              : `Show more (${hiddenCount} line${hiddenCount === 1 ? '' : 's'} hidden)`}
          </Button>
        </div>
      )}
    </CodeBlock>
  );
};
