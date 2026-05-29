import { redirect } from "next/navigation";

export const metadata = {
  title: "HAWKEYE Workflow",
  description: "Demo workflow investigasi digital HAWKEYE.",
};

export default function Page() {
  redirect("/dashboard");
}
