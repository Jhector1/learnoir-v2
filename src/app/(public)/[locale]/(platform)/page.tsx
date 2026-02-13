// src/app/[locale]/page.tsx
import React from "react";
import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import MathMarkdown from "@/components/math/MathMarkdown";
import VectorBasicsSketch from "@/components/review/sketches/linear_algebra/vectorpart1/VectorBasicsSketch";
import { cn } from "@/lib/cn";
import {ROUTES} from "@/utils";

type Locale = "en" | "fr" | "ht";

// const ROUTES = {
//   start: "/subjects",
//   catalog: "/subjects",
//   linearAlgebra: "subjects/linear-algebra/modules",
//   python: "/subjects/python/modules",
//   review: "/review",
//   signIn: "/auth/signin",
//   pricing: "/billing",
//   contact: "/contact",
//   privacy: "/privacy",
//   terms: "/terms",
// };

function CheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" {...props}>
      <path
        fillRule="evenodd"
        d="M16.704 5.29a1 1 0 010 1.414l-7.25 7.25a1 1 0 01-1.414 0l-3.25-3.25A1 1 0 016.204 9.29l2.543 2.543 6.543-6.543a1 1 0 011.414 0z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function Container({ children }: { children: React.ReactNode }) {
  return <div className="ui-container">{children}</div>;
}

function Pill({ children }: { children: React.ReactNode }) {
  return <span className="ui-home-pill">{children}</span>;
}

function SectionKicker({ children }: { children: React.ReactNode }) {
  return <div className="ui-section-kicker">{children}</div>;
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="ui-section-title">{children}</h2>;
}

function SectionSubtitle({ children }: { children: React.ReactNode }) {
  return <p className="ui-section-subtitle">{children}</p>;
}

function ButtonLink({
  href,
  children,
  variant = "primary",
}: {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "ghost";
}) {
  const styles =
    variant === "primary"
      ? "ui-btn-primary"
      : variant === "secondary"
        ? "ui-btn-secondary"
        : "ui-btn-ghost";

  return (
    <Link href={href} className={cn("ui-btn", styles)}>
      {children}
    </Link>
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = (await params) || "en";
  const t = await getTranslations({ locale, namespace: "Home" });

  const title = t("meta.title");
  const description = t("meta.description");

  return {
    title,
    description,
    applicationName: "Learnoir",
    openGraph: { title, description, type: "website" },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = (await params) || "en";
  const t = await getTranslations({ locale, namespace: "Home" });

  const heroPills = t.raw("hero.pills") as string[];
  const trustItems = t.raw("trust.items") as Array<{ k: string; v: string }>;
  const featureItems = t.raw("features.items") as Array<{
    title: string;
    desc: string;
  }>;
  const subjectCards = t.raw("subjects.cards") as Array<{
    title: string;
    desc: string;
    bullets: string[];
    cta: string;
  }>;
  const howSteps = t.raw("how.steps") as Array<{ title: string; desc: string }>;
  const educatorBullets = t.raw("educators.bullets") as string[];
  const testimonials = t.raw("testimonials.items") as Array<{
    quote: string;
    who: string;
  }>;
  const pricingTiers = t.raw("pricing.tiers") as Array<{
    name: string;
    price: string;
    desc: string;
    features: string[];
    cta: string;
    highlight: boolean;
  }>;
  const faqItems = t.raw("faq.items") as Array<{ q: string; a: string }>;

  const year = new Date().getFullYear();

  const subjectsWithRoutes = [
    { ...subjectCards[0], href: ROUTES.subjectModules("linear-algebra") },
    { ...subjectCards[1], href: ROUTES.subjectModules("python") },
  ];

  return (
    <main className="relative min-h-screen bg-white text-neutral-900 dark:bg-neutral-950 dark:text-white">
      {/* Background glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute -top-40 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-emerald-400/10 blur-3xl" />
        <div className="absolute top-[30%] right-[-120px] h-[420px] w-[420px] rounded-full bg-indigo-400/10 blur-3xl" />
      </div>

      {/* Hero */}
      <section className="relative pt-12 sm:pt-16">
        <Container>
          <div className="grid gap-10 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-3 py-1 text-xs font-semibold text-neutral-700 shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-white/80 dark:shadow-none">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                {t("hero.badge")}
              </div>

              <h1 className="mt-5 text-3xl font-semibold leading-tight text-neutral-950 dark:text-white sm:text-4xl lg:text-5xl">
                {t("hero.title")}
              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-6 text-neutral-600 dark:text-white/70 sm:text-base">
                {t("hero.subtitle")}
              </p>

              <div className="mt-6 flex flex-wrap gap-2">
                {heroPills.map((p) => (
                  <Pill key={p}>{p}</Pill>
                ))}
              </div>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                <ButtonLink href={ROUTES.catalog} variant="primary">
                  {t("hero.ctaPrimary")}
                </ButtonLink>
                <ButtonLink href={ROUTES.catalog} variant="secondary">
                  {t("hero.ctaSecondary")}
                </ButtonLink>
              </div>

              <div className="mt-6 text-xs text-neutral-500 dark:text-white/60">
                {t("ui.tagline")}
              </div>
            </div>

            {/* Hero visual */}
            <div className="lg:col-span-5">
              <div className={cn("ui-card", "p-4")}>
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold text-neutral-900 dark:text-white/90">
                    {t("ui.heroCard.title")}
                  </div>
                  <div className="text-xs text-neutral-500 dark:text-white/60">
                    {t("ui.heroCard.subtitle")}
                  </div>
                </div>

                <div className="mt-4 grid gap-3">
                  <div className={cn("ui-soft", "p-3")}>
                    <div className="text-xs font-semibold text-neutral-600 dark:text-white/70">
                      {t("ui.heroCard.laLabel")}
                    </div>
                    <div className="mt-1 text-sm text-neutral-900 dark:text-white/90">
                      {t("ui.heroCard.laText")}
                    </div>

                    <VectorBasicsSketch />

                    <div className="mt-2 text-xs text-neutral-500 dark:text-white/60">
                      {t("ui.heroCard.assetNote")}
                    </div>
                  </div>

                  <div className={cn("ui-soft", "p-3")}>
                    <div className="text-xs font-semibold text-neutral-600 dark:text-white/70">
                      {t("ui.heroCard.pyLabel")}
                    </div>
                    <div className="mt-1 text-sm text-neutral-900 dark:text-white/90">
                      {t("ui.heroCard.pyText")}
                    </div>
                    <pre className="mt-2 overflow-x-auto rounded-lg border border-neutral-200 bg-neutral-950 p-3 text-xs text-neutral-100 dark:border-white/10">
                      {
                        <MathMarkdown
                          content={`~~~python
def dot(a, b):
    return sum(x*y for x, y in zip(a, b))

print(dot([2, 1], [3, 4]))  # 10
~~~

`}
                        />
                      }
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Trust */}
      <section
        id="product"
        className="relative mt-14 border-t border-neutral-200 py-14 dark:border-white/10"
      >
        <Container>
          <div className="grid gap-10 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <SectionKicker>{t("trust.kicker")}</SectionKicker>
              <SectionTitle>{t("trust.title")}</SectionTitle>
              <SectionSubtitle>{t("trust.subtitle")}</SectionSubtitle>
            </div>

            <div className="lg:col-span-7">
              <div className="grid gap-4 sm:grid-cols-3">
                {trustItems.map((it) => (
                  <div key={it.k} className={cn("ui-card", "p-4")}>
                    <div className="text-sm font-semibold text-neutral-900 dark:text-white">
                      {it.k}
                    </div>
                    <div className="mt-2 text-sm leading-6 text-neutral-600 dark:text-white/70">
                      {it.v}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Features */}
      <section className="relative py-14">
        <Container>
          <SectionKicker>{t("features.kicker")}</SectionKicker>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <SectionTitle>{t("features.title")}</SectionTitle>
              <SectionSubtitle>{t("features.subtitle")}</SectionSubtitle>
            </div>
            <div className="flex gap-2">
              <ButtonLink href={ROUTES.review} variant="secondary">
                {t("ui.tryReview")}
              </ButtonLink>
              <ButtonLink href={ROUTES.catalog} variant="primary">
                {t("hero.ctaPrimary")}
              </ButtonLink>
            </div>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {featureItems.map((f) => (
              <div key={f.title} className={cn("ui-card", "p-5")}>
                <div className="text-sm font-semibold text-neutral-900 dark:text-white">
                  {f.title}
                </div>
                <div className="mt-2 text-sm leading-6 text-neutral-600 dark:text-white/70">
                  {f.desc}
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Subjects */}
      <section
        id="subjects"
        className="relative border-t border-neutral-200 py-14 dark:border-white/10"
      >
        <Container>
          <SectionKicker>{t("subjects.kicker")}</SectionKicker>
          <SectionTitle>{t("subjects.title")}</SectionTitle>
          <SectionSubtitle>{t("subjects.subtitle")}</SectionSubtitle>

          <div className="mt-10 grid gap-4 lg:grid-cols-2">
            {subjectsWithRoutes.map((s) => (
              <div key={s.title} className={cn("ui-card", "p-6")}>
                <div className="flex items-start justify-between gap-6">
                  <div>
                    <div className="text-lg font-semibold text-neutral-900 dark:text-white">
                      {s.title}
                    </div>
                    <p className="mt-2 text-sm leading-6 text-neutral-600 dark:text-white/70">
                      {s.desc}
                    </p>
                  </div>
                  <div className="hidden h-12 w-12 shrink-0 rounded-2xl bg-emerald-400/10 ring-1 ring-emerald-300/20 lg:block" />
                </div>

                <ul className="mt-5 space-y-2">
                  {s.bullets.map((b) => (
                    <li
                      key={b}
                      className="flex items-center gap-2 text-sm text-neutral-700 dark:text-white/80"
                    >
                      <CheckIcon className="h-4 w-4 text-emerald-600 dark:text-emerald-300" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-6">
                  <ButtonLink href={s.href} variant="secondary">
                    {s.cta}
                  </ButtonLink>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* How it works */}
      <section className="relative py-14">
        <Container>
          <SectionKicker>{t("how.kicker")}</SectionKicker>
          <SectionTitle>{t("how.title")}</SectionTitle>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {howSteps.map((st, idx) => (
              <div key={st.title} className={cn("ui-card", "p-6")}>
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-neutral-200 bg-white text-neutral-900 shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-white dark:shadow-none">
                    <span className="text-sm font-semibold">{idx + 1}</span>
                  </div>
                  <div className="text-sm font-semibold text-neutral-900 dark:text-white">
                    {st.title}
                  </div>
                </div>
                <p className="mt-3 text-sm leading-6 text-neutral-600 dark:text-white/70">
                  {st.desc}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Educators */}
      <section className="relative border-t border-neutral-200 py-14 dark:border-white/10">
        <Container>
          <div className="grid gap-10 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-7">
              <SectionKicker>{t("educators.kicker")}</SectionKicker>
              <SectionTitle>{t("educators.title")}</SectionTitle>
              <SectionSubtitle>{t("educators.subtitle")}</SectionSubtitle>

              <ul className="mt-6 space-y-2">
                {educatorBullets.map((b) => (
                  <li
                    key={b}
                    className="flex items-center gap-2 text-sm text-neutral-700 dark:text-white/80"
                  >
                    <CheckIcon className="h-4 w-4 text-emerald-600 dark:text-emerald-300" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-7 flex gap-2">
                <ButtonLink href={ROUTES.contact} variant="primary">
                  {t("educators.cta")}
                </ButtonLink>
                <ButtonLink href={ROUTES.catalog} variant="secondary">
                  {t("ui.browseModules")}
                </ButtonLink>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className={cn("ui-card", "p-6")}>
                <div className="text-sm font-semibold text-neutral-900 dark:text-white">
                  Deployment-ready layout
                </div>
                <p className="mt-2 text-sm leading-6 text-neutral-600 dark:text-white/70">
                  Embed cohort features, reporting screenshots, onboarding
                  steps, or a short Loom video here.
                </p>
                <div className="mt-4 h-36 rounded-xl border border-neutral-200 bg-gradient-to-br from-neutral-200/60 to-transparent dark:border-white/10 dark:from-white/[0.06]" />
                <p className="mt-2 text-xs text-neutral-500 dark:text-white/60">
                  {t("ui.heroCard.assetNote")}
                </p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Testimonials */}
      <section className="relative py-14">
        <Container>
          <SectionKicker>{t("testimonials.kicker")}</SectionKicker>
          <SectionTitle>{t("testimonials.title")}</SectionTitle>
          <SectionSubtitle>{t("testimonials.subtitle")}</SectionSubtitle>

          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            {testimonials.map((x, i) => (
              <div key={i} className={cn("ui-card", "p-6")}>
                <p className="text-sm leading-6 text-neutral-700 dark:text-white/80">
                  “{x.quote}”
                </p>
                <div className="mt-4 text-xs font-semibold text-neutral-500 dark:text-white/60">
                  {x.who}
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Pricing */}
      <section
        id="pricing"
        className="relative border-t border-neutral-200 py-14 dark:border-white/10"
      >
        <Container>
          <SectionKicker>{t("pricing.kicker")}</SectionKicker>
          <SectionTitle>{t("pricing.title")}</SectionTitle>
          <SectionSubtitle>{t("pricing.subtitle")}</SectionSubtitle>

          <div className="mt-10 grid gap-4 lg:grid-cols-3">
            {pricingTiers.map((tier) => (
              <div
                key={tier.name}
                className={cn(
                  "rounded-2xl border p-6",
                  tier.highlight
                    ? "border-emerald-300/40 bg-emerald-300/10 shadow-[0_0_0_1px_rgba(52,211,153,0.15)]"
                    : "border-neutral-200 bg-white shadow-sm dark:border-white/10 dark:bg-white/[0.03] dark:shadow-none",
                )}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-sm font-semibold text-neutral-900 dark:text-white">
                      {tier.name}
                    </div>
                    <div className="mt-2 text-3xl font-semibold text-neutral-950 dark:text-white">
                      {tier.price}
                    </div>
                    <div className="mt-2 text-sm text-neutral-600 dark:text-white/70">
                      {tier.desc}
                    </div>
                  </div>

                  {tier.highlight ? (
                    <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-semibold text-emerald-800 ring-1 ring-emerald-300/30 dark:text-emerald-200 dark:ring-emerald-300/20">
                      {t("ui.recommended")}
                    </span>
                  ) : null}
                </div>

                <ul className="mt-5 space-y-2">
                  {tier.features.map((f) => (
                    <li
                      key={f}
                      className="flex items-center gap-2 text-sm text-neutral-700 dark:text-white/80"
                    >
                      <CheckIcon className="h-4 w-4 text-emerald-600 dark:text-emerald-300" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-6">
                  <ButtonLink
                    href={
                      tier.name === "Pro" ||
                      tier.name === "Classe" ||
                      tier.name === "Classroom"
                        ? ROUTES.pricing
                        : ROUTES.catalog
                    }
                    variant={tier.highlight ? "primary" : "secondary"}
                  >
                    {tier.cta}
                  </ButtonLink>
                </div>
              </div>
            ))}
          </div>

          <p className="mt-6 text-xs text-neutral-500 dark:text-white/60">
            {t("pricing.note")}
          </p>
        </Container>
      </section>

      {/* FAQ */}
      <section id="faq" className="relative py-14">
        <Container>
          <SectionKicker>{t("faq.kicker")}</SectionKicker>
          <SectionTitle>{t("faq.title")}</SectionTitle>

          <div className="mt-8 grid gap-4 lg:grid-cols-2">
            {faqItems.map((it) => (
              <details key={it.q} className={cn("ui-card", "group p-5")}>
                <summary className="cursor-pointer list-none text-sm font-semibold text-neutral-900 dark:text-white">
                  <div className="flex items-center justify-between gap-4">
                    <span>{it.q}</span>
                    <span className="text-neutral-500 transition group-open:rotate-180 dark:text-white/50">
                      ▾
                    </span>
                  </div>
                </summary>
                <p className="mt-3 text-sm leading-6 text-neutral-600 dark:text-white/70">
                  {it.a}
                </p>
              </details>
            ))}
          </div>
        </Container>
      </section>

      {/* Final CTA + Footer */}
      <section className="relative border-t border-neutral-200 py-14 dark:border-white/10">
        <Container>
          <div className="rounded-2xl border border-neutral-200 bg-gradient-to-br from-emerald-400/10 to-white p-8 shadow-sm dark:border-white/10 dark:to-white/[0.02] dark:shadow-none">
            <div className="grid gap-6 lg:grid-cols-12 lg:items-center">
              <div className="lg:col-span-8">
                <h3 className="text-xl font-semibold text-neutral-900 dark:text-white sm:text-2xl">
                  {t("finalCta.title")}
                </h3>
                <p className="mt-2 text-sm leading-6 text-neutral-600 dark:text-white/70">
                  {t("finalCta.subtitle")}
                </p>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row lg:col-span-4 lg:justify-end">
                <ButtonLink href={ROUTES.catalog} variant="primary">
                  {t("finalCta.primary")}
                </ButtonLink>
                <ButtonLink href={ROUTES.catalog} variant="secondary">
                  {t("finalCta.secondary")}
                </ButtonLink>
              </div>
            </div>
          </div>

          <footer className="mt-10 border-t border-neutral-200 pt-8 dark:border-white/10">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm text-neutral-600 dark:text-white/70">
                {t("footer.rights", { year })}
              </div>

              <div className="flex flex-wrap gap-x-4 gap-y-2">
                <Link
                  href={ROUTES.catalog}
                  className="text-sm text-neutral-600 hover:text-neutral-950 dark:text-white/60 dark:hover:text-white"
                >
                  {t("footer.links.catalog")}
                </Link>
                <Link
                  href={ROUTES.review}
                  className="text-sm text-neutral-600 hover:text-neutral-950 dark:text-white/60 dark:hover:text-white"
                >
                  {t("footer.links.review")}
                </Link>
                <Link
                  href={ROUTES.pricing}
                  className="text-sm text-neutral-600 hover:text-neutral-950 dark:text-white/60 dark:hover:text-white"
                >
                  {t("footer.links.pricing")}
                </Link>
                <Link
                  href={ROUTES.contact}
                  className="text-sm text-neutral-600 hover:text-neutral-950 dark:text-white/60 dark:hover:text-white"
                >
                  {t("footer.links.contact")}
                </Link>
                <Link
                  href={ROUTES.privacy}
                  className="text-sm text-neutral-600 hover:text-neutral-950 dark:text-white/60 dark:hover:text-white"
                >
                  {t("footer.links.privacy")}
                </Link>
                <Link
                  href={ROUTES.terms}
                  className="text-sm text-neutral-600 hover:text-neutral-950 dark:text-white/60 dark:hover:text-white"
                >
                  {t("footer.links.terms")}
                </Link>
              </div>
            </div>
          </footer>
        </Container>
      </section>
    </main>
  );
}
