import { auth } from "@/lib/auth";

export const getSession = async () => auth();
