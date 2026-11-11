import AuthForm from "@/app/auth/AuthForm";

export const metadata = { title: "Masuk — Kalakai", robots: { index: false, follow: false } };

export default function LoginPage() {
  return <AuthForm mode="login" />;
}
