import Link from "next/link";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

const variantClasses: Record<Variant, string> = {
  primary: "bg-primary text-white hover:bg-primary-strong",
  secondary: "bg-primary-soft text-primary hover:bg-primary-muted",
  ghost: "bg-transparent text-foreground hover:bg-black/5",
  danger: "bg-danger text-white hover:opacity-90",
};

const sizeClasses: Record<Size, string> = {
  sm: "h-9 px-3 text-sm rounded-full",
  md: "h-11 px-5 text-sm rounded-full",
  lg: "h-13 px-6 text-base rounded-full",
};

interface ButtonBaseProps {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: React.ReactNode;
}

type ButtonOptions = {
  variant?: Variant;
  size?: Size;
  className?: string;
};

function classes({ variant = "primary", size = "md", className = "" }: ButtonOptions) {
  return [
    "inline-flex items-center justify-center gap-2 font-semibold transition-colors disabled:opacity-50 disabled:pointer-events-none cursor-pointer",
    variantClasses[variant],
    sizeClasses[size],
    className,
  ].join(" ");
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: ButtonBaseProps & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className={classes({ variant, size, className })} {...props}>
      {children}
    </button>
  );
}

export function ButtonLink({
  variant = "primary",
  size = "md",
  className,
  children,
  href,
  ...props
}: ButtonBaseProps &
  { href: string } &
  Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href">) {
  return (
    <Link href={href} className={classes({ variant, size, className })} {...props}>
      {children}
    </Link>
  );
}
