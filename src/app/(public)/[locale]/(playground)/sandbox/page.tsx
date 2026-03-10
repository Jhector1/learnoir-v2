import SandboxChooserClient from "./SandboxChooserClient";

export default async function SandboxPage({
                                              params,
                                          }: {
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;

    return (
        <div className="ui-container py-10">
            <SandboxChooserClient locale={locale} />
        </div>
    );
}