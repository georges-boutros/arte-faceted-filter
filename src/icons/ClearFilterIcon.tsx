import * as React from "react";

export type ClearFilterIconProps = {
  size?: number;
  className?: string;
  title?: string;
};

export const ClearFilterIcon: React.FC<ClearFilterIconProps> = ({ size = 18, className, title }) => {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 18 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden={title ? undefined : true}
      role={title ? "img" : undefined}
    >
      {title ? <title>{title}</title> : null}
      <path
        d="M11.7 2.9L15.1 6.3L8.4 13H4.9L3.1 11.2L11.7 2.9Z"
        stroke="currentColor"
        strokeWidth="1.35"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M9.7 4.8L13.1 8.2" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" />
      <path d="M4.7 13H14.6" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" />
    </svg>
  );
};
