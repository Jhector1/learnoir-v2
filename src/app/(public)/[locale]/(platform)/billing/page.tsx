import React from "react";
import BillingPageClient from "./BillingPageClient";

type SearchParams = Record<string, string | string[] | undefined>;

export default async function BillingPage({
                                              searchParams,
                                          }: {
    searchParams?: SearchParams | Promise<SearchParams>;
}) {
    const sp = await Promise.resolve(searchParams ?? {});
    const callbackUrl = typeof sp.callbackUrl === "string" ? sp.callbackUrl : "/";

    return <BillingPageClient callbackUrl={callbackUrl} />;
}
