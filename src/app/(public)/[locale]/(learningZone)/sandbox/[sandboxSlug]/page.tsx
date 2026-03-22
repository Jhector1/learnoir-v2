import SandboxSlugClient from "./SandboxSlugClient";

export default async function SandboxSlugPage({
                                                  params,
                                              }: {
    params: Promise<{ locale: string; sandboxSlug: string }>;
}) {
    const {locale, sandboxSlug} = await params;
    return (

        <SandboxSlugClient locale={locale} sandboxSlug={sandboxSlug}/>
    );
}
