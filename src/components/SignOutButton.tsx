import { signOut } from "@/lib/auth";

export function SignOutButton() {
  return (
    <form
      action={async () => {
        "use server";
        await signOut({ redirectTo: "/admin/login" });
      }}
    >
      <button type="submit" className="text-[#d7e6f2] hover:text-white">
        Sair
      </button>
    </form>
  );
}
