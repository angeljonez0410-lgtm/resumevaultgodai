import LoginForm from "../../../components/LoginForm";

export const dynamic = "force-dynamic";

export default function AdminLoginPage() {
  return (
    <main className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow p-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Login</h1>
        <p className="text-gray-600 mt-2">
          Sign in to access the ResumeVault Social Bot dashboard.
        </p>

        <LoginForm />
      </div>
    </main>
  );
}