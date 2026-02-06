import { redirect } from "next/navigation";
import { getCurrentUser } from "../../lib/auth";
import SignupForm from "./SignupForm";

export default async function SignupPage() {
  const currentUser = await getCurrentUser();
  if (currentUser) {
    redirect("/users");
  }
  return <SignupForm />;
}
