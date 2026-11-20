export interface HomeAssistant {
  callWS<T = unknown>(msg: Record<string, unknown>): Promise<T>;
  locale: { language: string };
  auth?: { data?: { hassUrl?: string } };
  themes?: { darkMode?: boolean };
}

export type TabId = "add" | "downloading" | "library";

export interface ArrCardConfig {
  type: string;
  instance?: string;
  title?: string;
  icon?: string;
  tabs?: TabId[];
  default_tab?: TabId;
  compact?: "auto" | boolean;
  layout?: "auto" | "phone" | "tablet";
  show_header_chips?: ("disk" | "queue" | "health")[];
  show_rows?: ("upcoming" | "recent")[];
  upcoming_days?: number;
  recent_days?: number;
  library_view?: "grid" | "list";
  library_sort?: string;
  library_filter?: string;
  add_defaults?: {
    quality_profile?: string;
    root_folder?: string;
    search_on_add?: boolean;
    minimum_availability?: string;
  };
  hide_destructive_actions?: boolean;
  external_link?: string | false;
}

export type ConfirmKind =
  | "m09"
  | "m10"
  | "d04"
  | "d04b"
  | "m06"
  | null;

export interface ConfirmState {
  kind: ConfirmKind;
  payload: Record<string, unknown>;
  blockRelease?: boolean;
  deleteFiles?: boolean;
  searchAgain?: boolean;
  removeFromClient?: boolean;
  addImportExclusion?: boolean;
}

export type AddPhase =
  | "start"
  | "searching"
  | "results"
  | "no_results"
  | "error"
  | "sheet"
  | "added";

export interface ReleaseRow {
  guid?: string;
  title?: string;
  size?: number;
  age?: number;
  seeders?: number;
  indexer?: string;
  rejections?: string[];
  approved?: boolean;
  customFormatScore?: number;
}