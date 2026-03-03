import { useEffect, useMemo, useState } from "react";
import type {
  TableSortConfig,
  ServexPriority,
  ServexStatus,
  ServexRecord,
} from "../../types/support";

type ServexTableRecord = ServexRecord;