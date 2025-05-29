export const dynamic = "force-dynamic";

import { LogsTable } from "./logs-table";
import { UserTable } from "./user-table";
import { getLogs } from "@/app/actions/logs";

const UserPage = async ({ searchParams }: { searchParams: { page?: string; limit?: string } }) => {
  // Parse pagination parameters from URL
  const page = parseInt(searchParams.page || "1");
  const limit = parseInt(searchParams.limit || "10");
  const offset = (page - 1) * limit;
  
  // Fetch logs with pagination
  const logsData = await getLogs({ limit, offset });
  
  return (
    <>
      <UserTable />
      <LogsTable 
        logs={logsData.logs} 
        total={logsData.total} 
        limit={limit} 
      />
    </>
  );
};

export default UserPage;
