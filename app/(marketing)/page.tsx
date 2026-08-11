import { APP_NAME, APP_TAGLINE } from "@/lib/constants";
import { ButtonLink } from "@/components/ui/button";
import { Icon } from "@/components/ui/icons";

export default function SplashPage() {
  return (
    <main className="flex min-h-dvh flex-1 flex-col items-center justify-center px-6 text-center">
      <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-primary text-white shadow-lg">
        <Icon name="heart" className="h-12 w-12" />
      </div>
      <h1 className="mt-6 text-4xl font-bold tracking-tight text-foreground">
        {APP_NAME}
      </h1>
      <p className="mt-2 max-w-xs text-muted">{APP_TAGLINE}</p>
      <p className="mt-1 text-sm text-muted">
        Follow-up is everyone&apos;s responsibility.
      </p>

      <div className="mt-10 flex w-full max-w-xs flex-col gap-3">
        <ButtonLink href="/onboarding" size="lg">
          Get started
        </ButtonLink>
        <ButtonLink href="/login" size="lg" variant="secondary">
          Sign in
        </ButtonLink>
      </div>
    </main>
  );
}
