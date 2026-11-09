/*
 * Presents an existing illustration in space: a soft light plate tinted to the image's
 * dominant tone, dashed orbit rings (echoing the connection lines in the artwork) and a
 * floor shadow. The image itself is passed through untouched as children.
 *
 *   <ImageStage tone="cobalt"><Image src="/images/recruiter.png" … /></ImageStage>
 */
export interface ImageStageProps {
  children: React.ReactNode;
  /** violet: hoodie characters · cobalt: blazer characters · neutral: mixed scenes */
  tone?: "violet" | "cobalt" | "neutral";
  rings?: boolean;
  floor?: boolean;
  className?: string;
}

export function ImageStage({ children, tone = "violet", rings = true, floor = true, className = "" }: ImageStageProps) {
  return (
    <div className={`stage stage-${tone} ${className}`}>
      <span aria-hidden="true" className={`stage-plate ${rings ? "stage-rings" : ""}`} />
      {children}
      {floor && <span aria-hidden="true" className="stage-floor" />}
    </div>
  );
}

/** Small glass chip floated over an ImageStage. Only ever show real product content in it. */
export function FloatChip({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`chip-float ${className}`}>{children}</div>;
}
