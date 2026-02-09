import HeaderSlick, { LearnHeaderSlick } from "@/components/HeaderSlick";

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
        <LearnHeaderSlick brand="Learnoir" badge="MVP" />
        {children}
      </div>
    // </html>
  );
}
