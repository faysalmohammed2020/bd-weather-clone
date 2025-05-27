import { LogsTable } from "./logs-table";
import { UserTable } from "./user-table";

const UserPage = async () => {
  const response = await fetch("http://localhost:7999/api/logs");
  const logs = await response.json();

  return (
    <>
      <UserTable />
      <LogsTable logs={logs} />
    </>
  );
}
 
export default UserPage;