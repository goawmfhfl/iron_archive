export interface NotionBlock {
  id: string;
  type: string;
  [key: string]: any;
}

export interface NotionPageContent {
  blocks: NotionBlock[];
  title?: string;
}

export interface NotionDatabasePage {
  id: string;
  url: string;
  title: string;
  properties: Record<string, any>;
}

export interface NotionDatabaseQueryResult {
  pages: NotionDatabasePage[];
  has_more: boolean;
  next_cursor: string | null;
}

