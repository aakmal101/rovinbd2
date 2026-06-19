import LoginForm from './LoginForm';

export default function AdminLogin() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50 px-4">
      <div className="card p-8 w-full max-w-sm">
        <h1 className="font-display text-2xl font-bold text-center text-brand-700">Admin Login</h1>
        <p className="text-center text-sm text-stone-500 mt-1">Rovin Bandana</p>
        <LoginForm />
      </div>
    </div>
  );
}
