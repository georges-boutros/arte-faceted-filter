import * as React from "react";

export const ChevronIcon: React.FC<{ size?: number; open?: boolean }> = ({ size = 12, open }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 12 12"
    fill="none"
    aria-hidden="true"
    style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 150ms ease" }}
  >
    <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
