"use client";

import { logs, users } from "@prisma/client";
import moment from "moment";

export const LogsTable = ({
  logs,
}: {
  logs: Array<{ actor: users; targetUser: users } & logs>;
}) => {
  return (
    <>
      <h1 className="text-2xl font-bold mb-6">Logs</h1>
      <div className=" bg-white py-6 rounded-xl border shadow">
        <div className="overflow-auto">
          <table className="w-full">
            <thead className="border-b-2 border-slate-300 bg-slate-100">
              <tr>
                <th className="p-3 text-lg font-medium whitespace-nowrap min-w-max-[250px] text-left">
                  Time
                </th>
                <th className="p-3 text-lg font-medium whitespace-nowrap min-w-max-[250px] text-left">
                  Actor Name
                </th>
                <th className="p-3 text-lg font-medium whitespace-nowrap min-w-max-[250px] text-left">
                  Actor Email
                </th>
                <th className="p-3 text-lg font-medium whitespace-nowrap min-w-max-[250px] text-left">
                  Actor Role
                </th>
                <th className="p-3 text-lg font-medium whitespace-nowrap min-w-max-[250px] text-left">
                  Target User
                </th>
                <th className="p-3 text-lg font-medium whitespace-nowrap min-w-max-[250px] text-left">
                  Target Email
                </th>
                <th className="p-3 text-lg font-medium whitespace-nowrap min-w-max-[250px] text-left">
                  Action
                </th>
                <th className="p-3 text-lg font-medium whitespace-nowrap min-w-max-[250px] text-left">
                  Action Text
                </th>
                <th className="p-3 text-lg font-medium whitespace-nowrap min-w-max-[250px] text-left">
                  Module
                </th>
                <th className="p-3 text-lg font-medium whitespace-nowrap min-w-max-[250px] text-left">
                  Details
                </th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-b">
                  <td className="p-3 text-left truncate max-w-[250px]">
                    {moment(log.createdAt).format("YYYY-MM-DD HH:mm:ss")}
                  </td>
                  <td className="p-3 text-left truncate max-w-[250px]">
                    {log.actor?.name ?? "--"}
                  </td>
                  <td className="p-3 text-left truncate max-w-[250px]">
                    {log.actorEmail}
                  </td>
                  <td className="p-3 text-left truncate max-w-[250px]">
                    {log.role}
                  </td>
                  <td className="p-3 text-left truncate max-w-[250px]">
                    {log.targetUser?.name ?? "--"}
                  </td>
                  <td className="p-3 text-left truncate max-w-[250px]">
                    {log.targetEmail}
                  </td>
                  <td className="p-3 text-left truncate max-w-[250px]">
                    {log.action}
                  </td>
                  <td className="p-3 text-left truncate max-w-[250px]">
                    {log.actionText}
                  </td>
                  <td className="p-3 text-left truncate max-w-[250px]">
                    {log.module}
                  </td>
                  <td className="p-3 text-left truncate max-w-[250px]">
                    {JSON.stringify(log.details)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};
