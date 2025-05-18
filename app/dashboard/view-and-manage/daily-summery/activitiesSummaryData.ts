"use client";

import { type MRT_ColumnDef } from "mantine-react-table";

export interface ActivitySummary {
  id: number;
  month: string;
  tasks: number;
  activities: number;
  messages: number;
  totalActions: number;
}

export const activitySummaryData: ActivitySummary[] = [
  {
    id: 1,
    month: "October",
    tasks: 38,
    activities: 3,
    messages: 3,
    totalActions: 237,
  },
  {
    id: 2,
    month: "September",
    tasks: 125,
    activities: 17,
    messages: 7,
    totalActions: 356,
  },
  {
    id: 3,
    month: "August",
    tasks: 55,
    activities: 35,
    messages: 11,
    totalActions: 560,
  },
  {
    id: 4,
    month: "July",
    tasks: 91,
    activities: 12,
    messages: 63,
    totalActions: 483,
  },
  {
    id: 5,
    month: "June",
    tasks: 140,
    activities: 102,
    messages: 14,
    totalActions: 94,
  },
];

export const activitySummaryColumns: MRT_ColumnDef<ActivitySummary>[] = [
  { accessorKey: "month", header: "Month" },
  { accessorKey: "tasks", header: "Tasks" },
  { accessorKey: "activities", header: "Activities" },
  { accessorKey: "messages", header: "Messages" },
  { accessorKey: "totalActions", header: "Total Actions" },
];
