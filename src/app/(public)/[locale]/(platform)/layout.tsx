import HeaderSlick from "@/components/HeaderSlick";

export default async function PlatformLayout({
  children,
//   params,
}: Readonly<{
  children: React.ReactNode;
//   params: Promise<{ locale: string }>;
}>) {
  return (
    // <html>
      <div >
        <HeaderSlick brand={process.env.APP_NAME} badge="MVP" />
        {children}
      </div>
    // </html>
  );
}
