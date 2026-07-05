"use client";

import { useEffect, type ReactNode } from "react";

type Props = {
  children: ReactNode;
};

/**
 * The authenticated app shell locks `html, body` to `overflow: hidden`
 * (see app/globals.css) because the chat UI manages its own internal
 * scroll regions. The marketing landing page, however, is a normal tall
 * page that needs the document to scroll. Rather than changing the global
 * rule (which the chat UI depends on), we toggle it off only while this
 * route group is mounted.
 */
const MarketingLayout = ({ children }: Props) => {
  useEffect(() => {
    const html = document.documentElement;
    const { body } = document;
    const previousHtmlOverflow = html.style.overflow;
    const previousBodyOverflow = body.style.overflow;

    html.style.overflow = "auto";
    body.style.overflow = "auto";

    return () => {
      html.style.overflow = previousHtmlOverflow;
      body.style.overflow = previousBodyOverflow;
    };
  }, []);

  return <>{children}</>;
};

export default MarketingLayout;
