import AuthForm from "@/app/auth/AuthForm";

export const metadata = { title: "Daftar akun — Kalakai", robots: { index: false, follow: false } };

export default function RegisterPage() {
  return <AuthForm mode="register" />;
}
