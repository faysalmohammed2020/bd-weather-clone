export const dynamic = "force-dynamic";

import { LogsTable } from "./logs-table";
import { UserTable } from "./user-table";
import { getLogs } from "@/lib/api";

const UserPage = async () => {
  const logs = await getLogs();

  return (
    <>
      <UserTable />
      <LogsTable logs={logs} />
    </>
  );
};

export default UserPage;
