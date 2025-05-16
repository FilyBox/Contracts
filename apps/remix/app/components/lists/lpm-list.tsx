import { Trans } from '@lingui/react/macro';
import { Loader2, MoreVertical } from 'lucide-react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';

import { trpc } from '@documenso/trpc/react';
import { Button } from '@documenso/ui/primitives/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@documenso/ui/primitives/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@documenso/ui/primitives/table';

export const LpmTable = ({
  lpm,
  isLoading,
  isLoadingError,
  onlpmClick,
  refetch,
}: {
  lpm: Array<{
    id: number;
    upc: string;
    isrc: string;
    preOrderDate: string;
    productPriceTier: string;
    trackPlayLink: string;
    originalReleaseDate: string;
    parentLabel: string;
    productId: string;
    productType: string;
    productTitle: string;
    trackName: string;
    productPlayLink: string;
  }>;
  isLoading: boolean;
  isLoadingError: boolean;
  onlpmClick: (lpmId: number) => void;
  refetch: () => Promise<void>;
}) => {
  const navigate = useNavigate();
  const { mutateAsync: deletelpm } = trpc.lpm.deleteLpmById.useMutation();
  const handleDeletelpm = async (lpmId: number) => {
    try {
      await deletelpm({ id: lpmId });
      toast.success('Tarea eliminada correctamente');
      await refetch();
    } catch (error) {
      toast.error('Error al eliminar la tarea');
      console.error('Error deleting lpm:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (isLoadingError) {
    return (
      <div className="flex h-64 items-center justify-center text-red-500">
        <Trans>Error al cargar las tareas</Trans>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[50px]">
            <Trans>Id del producto</Trans>
          </TableHead>
          <TableHead>
            <Trans>UPC</Trans>
          </TableHead>
          <TableHead>
            <Trans>ISRC</Trans>
          </TableHead>
          <TableHead>
            <Trans>Track name</Trans>
          </TableHead>
          <TableHead>
            <Trans>Link de la cancion</Trans>
          </TableHead>
          <TableHead className="w-[50px]">
            <Trans>Acciones</Trans>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {lpm.map((lpm) => (
          <TableRow key={lpm.productId} className="hover:bg-muted/50 cursor-pointer">
            <TableCell onClick={() => onlpmClick(lpm.id)}>
              <div className="font-medium">
                {lpm.upc.length > 20 ? `${lpm.upc.substring(0, 20)}...` : lpm.upc}
              </div>
            </TableCell>
            <TableCell onClick={() => onlpmClick(lpm.id)}>
              <div className="font-medium">{lpm.isrc}</div>
            </TableCell>
            <TableCell onClick={() => onlpmClick(lpm.id)}>{lpm.upc}</TableCell>
            <TableCell onClick={() => onlpmClick(lpm.id)}>
              <div className="font-medium">{lpm.trackName}</div>
            </TableCell>
            <TableCell onClick={() => onlpmClick(lpm.id)}>
              <div className="font-medium">{lpm.productPlayLink}</div>
            </TableCell>
            <TableCell>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onlpmClick(lpm.id)}>
                    <Trans>Ver detalles</Trans>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={async () => navigate(`/lpm/${lpm.id}/edit`)}>
                    <Trans>Editar</Trans>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-red-500"
                    onClick={(e) => {
                      e.stopPropagation();
                      void handleDeletelpm(lpm.id);
                    }}
                  >
                    <Trans>Eliminar</Trans>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
            <TableCell></TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
