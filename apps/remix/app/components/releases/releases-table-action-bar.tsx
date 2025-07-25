// import { type Task, tasks } from "@/db/schema";
import * as React from 'react';

import type { Table } from '@tanstack/react-table';
import { Download, Trash2 } from 'lucide-react';

import { trpc } from '@documenso/trpc/react';
import type { TFindReleaseResponse } from '@documenso/trpc/server/releases-router/schema';
import { exportTableToCSV } from '@documenso/ui/lib/export';
import {
  DataTableActionBar,
  DataTableActionBarAction,
  DataTableActionBarSelection,
} from '@documenso/ui/primitives/data-table-action-bar';
import { Separator } from '@documenso/ui/primitives/separator';
import { useToast } from '@documenso/ui/primitives/use-toast';

const actions = ['update-status', 'update-priority', 'export', 'delete'] as const;

type Action = (typeof actions)[number];
type ReleaseTableRow = TFindReleaseResponse['data'][number];

interface ReleasesTableActionBarProps {
  table: Table<ReleaseTableRow>;
}

export function ReleasesTableActionBar({ table }: ReleasesTableActionBarProps) {
  const { toast } = useToast();
  const rows = table.getFilteredSelectedRowModel().rows;
  const [isPending, startTransition] = React.useTransition();
  const [currentAction, setCurrentAction] = React.useState<Action | null>(null);
  const deleteMultipleContractsMutation = trpc.release.deleteMultipleByIds.useMutation();
  const getIsActionPending = React.useCallback(
    (action: Action) => isPending && currentAction === action,
    [isPending, currentAction],
  );

  const handleMultipleDelete = () => {
    setCurrentAction('delete');
    try {
      const ids = rows.map((row) => row.original.id);
      startTransition(async () => {
        await deleteMultipleContractsMutation.mutateAsync({ ids: ids });

        toast({
          description: `${ids.length} deleted successfully`,
        });
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        description: 'Error deleting data',
      });
      console.error('Error deleting record:', error);
    }
  };

  const onTaskExport = React.useCallback(() => {
    setCurrentAction('export');
    startTransition(() => {
      exportTableToCSV(table, {
        excludeColumns: ['select', 'actions'],
        onlySelected: true,
      });
    });
  }, [table]);

  // const onTaskDelete = React.useCallback(() => {
  //   setCurrentAction("delete");
  //   startTransition(async () => {
  //     const { error } = await deleteTasks({
  //       ids: rows.map((row) => row.original.id),
  //     });

  //     if (error) {
  //       toast({
  //         description: `${error} `,
  //         variant: "destructive",
  //       });
  //       return;
  //     }
  //     table.toggleAllRowsSelected(false);
  //   });
  // }, [rows, table]);

  return (
    <DataTableActionBar table={table} visible={rows.length > 0}>
      <DataTableActionBarSelection table={table} />
      <Separator
        orientation="vertical"
        className="hidden data-[orientation=vertical]:h-5 sm:block"
      />
      <div className="flex items-center gap-1.5">
        {/* <Select
          onValueChange={(value: string) =>
            onTaskUpdate({ field: 'status', value: value as ContractStatus })
          }
        >
          <SelectTrigger asChild>
            <DataTableActionBarAction
              size="icon"
              tooltip="Update status"
              isPending={getIsActionPending('update-status')}
            >
              <CheckCircle2 />
            </DataTableActionBarAction>
          </SelectTrigger>
          <SelectContent align="center">
            <SelectGroup>
              {Object.values(ContractStatus).map((status) => (
                <SelectItem key={status} value={status} className="capitalize">
                  {status}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select> */}
        <DataTableActionBarAction
          size="icon"
          tooltip="Delete"
          isPending={isPending || currentAction === 'delete'}
          onClick={handleMultipleDelete}
        >
          <Trash2 />
        </DataTableActionBarAction>

        <DataTableActionBarAction
          size="icon"
          tooltip="Export"
          isPending={getIsActionPending('export')}
          onClick={onTaskExport}
        >
          <Download />
        </DataTableActionBarAction>
        {/* <DataTableActionBarAction
          size="icon"
          tooltip="Delete"
          isPending={getIsActionPending("delete")}
          onClick={onTaskDelete}
        >
          <Trash2 />
        </DataTableActionBarAction> */}
      </div>
    </DataTableActionBar>
  );
}
