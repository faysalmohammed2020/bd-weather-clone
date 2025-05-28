export const dynamic = "force-dynamic";

import { LogsTable } from "./logs-table";
import { UserTable } from "./user-table";
import { getLogs } from "@/app/actions/logs";
import { getSession } from "@/lib/getSession";

const UserPage = async () => {
  const session = await getSession()
  const logs = await getLogs();

  return (
    <>
      {session?.user?.role === "super_admin" && <UserTable />}
      <LogsTable logs={logs} />
    </>
  );
};

export default UserPage;
