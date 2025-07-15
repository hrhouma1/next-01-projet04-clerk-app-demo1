import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
  return (
    <div className="p-8">
      <SignUp path="/sign-up" />
    </div>
  );
}
