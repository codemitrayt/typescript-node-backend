export interface IConversationFilter {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "ASC" | "DESC";
  search?: string;
  createdBy?: string;
  isPinned?: boolean;
}
