/**
 * Diagonal "STUB — NOT FOR SUBMISSION" watermark applied to any screenshot
 * that landed below rung 1 (real-build) on the fallback ladder.
 * See docs/07-fallback-ladders.md.
 *
 * Diagonal banner, not a corner ribbon: a tired user can crop or overlook a
 * corner. The factory's whole bet is not lying — the watermark is loud on
 * purpose. Semi-transparent so the layout below stays readable for review.
 */

export function StubWatermark() {
  return (
    <div
      aria-hidden
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 9999,
        overflow: 'hidden',
        background:
          'repeating-linear-gradient(-45deg, rgba(220,38,38,0) 0 80px, rgba(220,38,38,0.06) 80px 120px)',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%) rotate(-22deg)',
          fontSize: 96,
          fontWeight: 900,
          letterSpacing: '0.12em',
          color: 'rgba(220,38,38,0.34)',
          textShadow: '0 2px 0 rgba(255,255,255,0.4)',
          whiteSpace: 'nowrap',
          fontFamily:
            'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Helvetica, Arial, sans-serif',
        }}
      >
        STUB — NOT FOR SUBMISSION
      </div>
    </div>
  );
}
