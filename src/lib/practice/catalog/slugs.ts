import { GENERATED_CATALOG } from "@/lib/practice/catalog/generatedCatalog";

export type CatalogSubject = keyof typeof GENERATED_CATALOG;
export type CatalogModule<S extends CatalogSubject> =
  keyof (typeof GENERATED_CATALOG)[S]["modulesBySlug"];

export function getModuleSlugs<
  S extends CatalogSubject,
  M extends CatalogModule<S>,
>(subject: S, module: M) {
  const mod = GENERATED_CATALOG[subject].modulesBySlug[module];

  return {
    subject,
    module,
    section: mod.sectionSlug,
    genKey: mod.genKey,
    prefix: mod.prefix,
    topics: mod.topics,
    topicIds: mod.topicIds,
    title: mod.sectionTitle,
    order: mod.sectionOrder,
  } as const;
}
