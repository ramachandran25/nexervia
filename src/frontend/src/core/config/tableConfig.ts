import type {
  FilterOption,
  ServexPriority,
  ServexRecord,
  ServexStatus,
  SupportTableId,
  TableConfig,
  TableModuleConfig,
} from "../../types/support";

export type TableId = SupportTableId;

export type TableConfigMap = {
  [id in TableId]: TableConfig;
};

export const supportModules: TableModuleConfig[] = [
  {
    id: "service_requests",
    label: "Service Requests",
    icon: "InboxStack",
    order: 10,
  },
  {
    id: "cmdb",
    label: "CMDB",
    icon: "ServerStack",
    order: 20,
  },
];

const servexStatusOptions: FilterOption[] = [
  { value: "Open", label: "Open" },
  { value: "In Progress", label: "In Progress" },
  { value: "Pending", label: "Pending" },
  { value: "Resolved", label: "Resolved" },
  { value: "Closed", label: "Closed" },
  { value: "Canceled", label: "Canceled" },
];

const servexPriorityOptions: FilterOption[] = [
  { value: "P1 - Critical", label: "P1 - Critical" },
  { value: "P2 - High", label: "P2 - High" },
  { value: "P3 - Medium", label: "P3 - Medium" },
  { value: "P4 - Low", label: "P4 - Low" },
];

export const tableConfig: TableConfigMap = {
  servex: {
    id: "servex",
    moduleId: "service_requests",
    name: "ServEx Requests",
    description: "Service request tickets raised by customers for managed services.",
    icon: "Ticket",

    list: {
      columns: [
        {
          key: "number",
          label: "Number",
          widthClass: "w-36",
          sortable: true,
        },
        {
          key: "title",
          label: "Title",
          widthClass: "min-w-[220px]",
          sortable: true,
        },
        {
          key: "customer",
          label: "Customer",
          widthClass: "min-w-[160px]",
          sortable: true,
        },
        {
          key: "status",
          label: "Status",
          widthClass: "w-32",
          sortable: true,
        },
        {
          key: "priority",
          label: "Priority",
          widthClass: "w-36",
          sortable: true,
        },
        {
          key: "updatedAt",
          label: "Updated",
          widthClass: "w-40",
          sortable: true,
        },
      ],
      defaultSort: {
        columnKey: "updatedAt",
        direction: "desc",
      },
      defaultPageSize: 25,
      searchable: true,
      filters: [
        {
          key: "search",
          label: "Search",
          type: "search",
          placeholder: "Number, title, customer…",
        },
        {
          key: "status",
          label: "Status",
          type: "select",
          options: servexStatusOptions,
        },
        {
          key: "priority",
          label: "Priority",
          type: "select",
          options: servexPriorityOptions,
        },
      ],
    },

    form: {
      primaryField: "title",
      sections: [
        {
          id: "identity",
          title: "Identity",
          description: "Core identifiers and customer context.",
          fields: [
            {
              name: "number",
              label: "Number",
              type: "readonly",
              colSpan: 1,
            },
            {
              name: "customer",
              label: "Customer",
              type: "reference",
              required: true,
              colSpan: 1,
            },
            {
              name: "service",
              label: "Service",
              type: "reference",
              colSpan: 1,
            },
            {
              name: "title",
              label: "Title",
              type: "text",
              required: true,
              colSpan: 2,
            },
          ],
        },
        {
          id: "details",
          title: "Details",
          description: "Business impact, classification, and description.",
          fields: [
            {
              name: "category",
              label: "Category",
              type: "select",
              options: [
                { value: "access", label: "Access" },
                { value: "request", label: "Request" },
                { value: "incident", label: "Incident" },
                { value: "other", label: "Other" },
              ],
              colSpan: 1,
            },
            {
              name: "subcategory",
              label: "Subcategory",
              type: "text",
              colSpan: 1,
            },
            {
              name: "shortDescription",
              label: "Short description",
              type: "text",
              required: true,
              colSpan: 2,
            },
            {
              name: "description",
              label: "Description",
              type: "textarea",
              colSpan: 2,
            },
          ],
        },
        {
          id: "lifecycle",
          title: "Lifecycle & Assignment",
          description: "State, ownership, and SLA tracking.",
          fields: [
            {
              name: "status",
              label: "Status",
              type: "select",
              required: true,
              options: servexStatusOptions,
              colSpan: 1,
            },
            {
              name: "priority",
              label: "Priority",
              type: "select",
              required: true,
              options: servexPriorityOptions,
              colSpan: 1,
            },
            {
              name: "assignmentGroup",
              label: "Assignment group",
              type: "reference",
              colSpan: 1,
            },
            {
              name: "assignee",
              label: "Assignee",
              type: "reference",
              colSpan: 1,
            },
            {
              name: "sla",
              label: "SLA",
              type: "reference",
              colSpan: 1,
            },
            {
              name: "tags",
              label: "Tags",
              type: "tags",
              colSpan: 1,
            },
            {
              name: "createdAt",
              label: "Created",
              type: "readonly",
              colSpan: 1,
            },
            {
              name: "updatedAt",
              label: "Updated",
              type: "readonly",
              colSpan: 1,
            },
          ],
        },
      ],
    },
  },
};

// Helper type for future hooks / UI components that consume ServEx records
export type ServexTableRecord = ServexRecord & {
  status: ServexStatus;
  priority: ServexPriority;
};

