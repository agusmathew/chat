import { redirect } from "next/navigation";
import { getCurrentUser } from "../../lib/auth";
import SigninForm from "./SigninForm";

export default async function SigninPage() {
  const currentUser = await getCurrentUser();
  if (currentUser) {
    redirect("/users");
  }
  return <SigninForm />;
}
