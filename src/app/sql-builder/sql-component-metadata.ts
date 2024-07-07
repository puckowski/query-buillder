import { SqlCompilableMetadata } from "./sql-components/base-sql-compilable";

export const SQL_COMPONENT_METADATA: SqlCompilableMetadata[] = [
    {
        componentName: 'AppSqlConstant',
        canStartQuery: true,
        canEndQuery: true
    },
    {
        componentName: 'AppSqlField',
        canStartQuery: true,
        canEndQuery: true
    },
    {
        componentName: 'AppSqlOperator',
        canStartQuery: false,
        canEndQuery: false
    },
    {
        componentName: 'AppSqlFunction',
        canStartQuery: false,
        canEndQuery: true
    }
];
