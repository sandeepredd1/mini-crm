export interface User {
  _id: string;
  name: string;
  email: string;
}

export type CustomerStatus =
  | "active"
  | "inactive"
  | "lead";

export interface Customer {
  _id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  status: CustomerStatus;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export type DealStage =
  | "Lead"
  | "Qualified"
  | "Proposal"
  | "Won"
  | "Lost";

export interface Deal {
  _id: string;
  customerId: string;
  title: string;
  value: number;
  stage: DealStage;
  expectedCloseDate: string;
  createdAt: string;
  updatedAt: string;
}

export type TaskPriority =
  | "Low"
  | "Medium"
  | "High";

export interface Task {
  _id: string;
  customerId?: string;
  dealId?: string;
  title: string;
  dueDate: string;
  priority: TaskPriority;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardSummary {
  totalCustomers: number;
  openPipelineValue: number;
  dealsWonThisMonth: number;
  tasksDueToday: number;
  overdueTasks: number;
}

export interface PipelineItem {
  stage: DealStage;
  value: number;
  count: number;
}

export interface DashboardData {
  summary: DashboardSummary;
  pipeline: PipelineItem[];
}