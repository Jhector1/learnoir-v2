
import SandboxChooserClient from "./SandboxChooserClient";

export default function SandboxPage({ params }: { params: { locale: string } }) {
    return (
        <div className="ui-container py-10">
            <SandboxChooserClient locale={params.locale} />
        </div>
    );
}




