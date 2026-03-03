export type SupportTableId = "servex";

export type SortDirection = "asc" | "desc";

export type FieldInputType =
  | "text"
  | "textarea"
  | "select"
  | "reference"
  | "choice"
  | "datetime"
  | "readonly"
  | "tags";

export interface ListColumn {
  /** Property key on the record, e.g. "number" or "status" */
  key: string;
  /** Human label shown in the list header */
  label: string;
  /** Optional tailwind width class, e.g. "w-32" or "min-w-[180px]" */
  widthClass?: string;
  /** Alignment of the column content */
  align?: "left" | "center" | "right";
  /** Whether the column is sortable */
  sortable?: boolean;
}

export interface TableSortConfig {
  columnKey: string;
  direction: SortDirection;
}

export type FilterType = "search" | "select";

export interface FilterOption {
  value: string;
  label: string;
}

export interface TableFilterConfig {
  /** Query or field key, e.g. "status" */
  key: string;
  label: string;
  type: FilterType;
  placeholder?: string;
  options?: FilterOption[];
}

export interface FormFieldConfig {
  /** Field name on the record, e.g. "shortDescription" */
  name: string;
  label: string;
  type: FieldInputType;
  required?: boolean;
  readOnly?: boolean;
  placeholder?: string;
  helpText?: string;
  /** Optional options for select / choice fields */
  options?: FilterOption[];
  /** Layout hints for desktop 2-column forms */
  colSpan?: 1 | 2;
}

export interface FormSectionConfig {
  id: string;
  title: string;
  description?: string;
  fields: FormFieldConfig[];
}

export interface TableModuleConfig {
  /** Logical module id, e.g. "service_requests" or "cmdb" */
  id: string;
  /** Display label for the module grouping */
  label: string;
  /** Optional icon identifier for future use */
  icon?: string;
  order?: number;
}

export interface TableConfig {
  id: SupportTableId;
  /** Module that this table belongs to (Service Requests, CMDB, etc.) */
  moduleId: string;
  /** Human display name for the table */
  name: string;
  description?: string;
  icon?: string;

  list: {
    columns: ListColumn[];
    defaultSort?: TableSortConfig;
    defaultPageSize?: number;
    filters?: TableFilterConfig[];
    /** Whether free-text search is enabled */
    searchable?: boolean;
  };

  form: {
    /** Field used as the primary display / title */
    primaryField: string;
    sections: FormSectionConfig[];
  };
}

/**
 * Concrete example record type for the "servex" table.
 * This models a service request / ticket style record.
 */
export type ServexStatus =
  | "Open"
  | "In Progress"
  | "Pending"
  | "Resolved"
  | "Closed"
  | "Canceled";

export type ServexPriority = "P1 - Critical" | "P2 - High" | "P3 - Medium" | "P4 - Low";

export interface ServexRecord {
  id: string;
  /** Human-friendly ticket number, e.g. SRV000123 */
  number: string;
  title: string;

  /** Customer / account context */
  customer: string;
  service?: string;

  /** Classification */
  category?: string;
  subcategory?: string;

  /** Assignment */
  assignmentGroup?: string;
  assignee?: string;

  /** Lifecycle */
  status: ServexStatus;
  priority: ServexPriority;
  sla?: string;

  /** Descriptive fields */
  shortDescription: string;
  description?: string;

  /** Audit / timestamps */
  createdAt: string;
  createdBy?: string;
  updatedAt: string;
  updatedBy?: string;
}

