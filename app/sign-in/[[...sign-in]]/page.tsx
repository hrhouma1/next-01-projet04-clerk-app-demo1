import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <div className="p-8">
      <SignIn path="/sign-in" />
    </div>
  );
}
