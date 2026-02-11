import HeaderSlick, { LearnHeaderSlick } from "@/components/HeaderSlick";
import React from "react";

export default async function LearnLayout({
  children,
//   params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  return (
    // <html>
      <div >
          <HeaderSlick isBillingStatus={false} brand="Learnoir" badge="Sandbox" isUser={false} isNav={false} />
        {children}
      </div>
    // </html>
  );
}
