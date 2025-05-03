"use client";

import { signOut, useSession } from "@/lib/auth-client";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

const Profile = () => {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  return (
    <div className="flex items-center gap-6">
      {isPending ? (
        <div>Loading...</div>
      ) : (
        <>
          <div className="flex flex-col">
            <span className="whitespace-nowrap font-medium text-white uppercase text-shadow">
              {session?.user.name} ({session?.user.role})
            </span>
            <span className="uppercase text-xs text-white text-shadow">
              {session?.user.district}
            </span>
          </div>
        </>
      )}

      <Button
        variant="secondary"
        onClick={() => {
          signOut({
            fetchOptions: {
              onSuccess: () => {
                router.push("/");
                router.refresh();
              },
            },
          });
        }}
      >
        <LogOut />
        <span>Logout</span>
      </Button>
    </div>
  );
};

export default Profile;
