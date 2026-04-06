// Redirect old calculator route to the new carbonemission page
import { redirect } from "next/navigation";

export default function OldCalculatorPage() {
  redirect("/carbonemission");
}
