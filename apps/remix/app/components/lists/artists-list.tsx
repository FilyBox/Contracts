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

export const ArtistTable = ({
  artists,
  isLoading,
  isLoadingError,
  onartistClick,
  refetch,
}: {
  artists: Array<{
    id: number;
    name: string;
    role: 'ADMIN' | 'USER';
    events: Array<{ name: string }>;
    songs: Array<{ name: string }>;
    url: string;
    disable: boolean;
    createdAt: Date;
    updatedAt: Date;
  }>;
  isLoading: boolean;
  isLoadingError: boolean;
  onartistClick: (artistId: number) => void;
  refetch: () => Promise<void>;
}) => {
  const navigate = useNavigate();
  const { mutateAsync: deleteartist } = trpc.artist.deleteArtist.useMutation();
  const handleDeleteartist = async (artistId: number) => {
    try {
      await deleteartist({ artistId });
      toast.success('Tarea eliminada correctamente');
      await refetch();
    } catch (error) {
      toast.error('Error al eliminar la tarea');
      console.error('Error deleting artist:', error);
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
            <Trans>Estado</Trans>
          </TableHead>
          <TableHead>
            <Trans>Título</Trans>
          </TableHead>
          <TableHead>
            <Trans>Prioridad</Trans>
          </TableHead>
          <TableHead>
            <Trans>Asignados</Trans>
          </TableHead>
          <TableHead>
            <Trans>Fecha límite</Trans>
          </TableHead>
          <TableHead className="w-[50px]">
            <Trans>Acciones</Trans>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {artists.map((artist) => (
          <TableRow key={artist.id} className="hover:bg-muted/50 cursor-pointer">
            <TableCell onClick={() => onartistClick(artist.id)}>
              {/* {artist.status === 'COMPLETED' ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <Circle className="text-muted-foreground h-5 w-5" />
              )} */}
            </TableCell>
            <TableCell onClick={() => onartistClick(artist.id)}>
              <div className="font-medium">
                {artist.name.length > 20 ? `${artist.name.substring(0, 20)}...` : artist.name}
              </div>
              {/* {artist.description && (
                <div className="text-muted-foreground line-clamp-1 text-sm">
                  {artist.description.length > 20
                    ? `${artist.description.substring(0, 20)}...`
                    : artist.description}
                </div>
              )} */}
            </TableCell>
            <TableCell onClick={() => onartistClick(artist.id)}>
              {/* <div className="flex items-center gap-2">
                {artist.priority === 'HIGH' && <Flag className="h-4 w-4 fill-red-500 text-red-500" />}
                {artist.priority === 'MEDIUM' && (
                  <Flag className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                )}
                {artist.priority === 'LOW' && (
                  <Flag className="h-4 w-4 fill-blue-500 text-blue-500" />
                )}
                <span>
                  {artist.priority === 'HIGH' && <Trans>Alta</Trans>}
                  {artist.priority === 'MEDIUM' && <Trans>Media</Trans>}
                  {artist.priority === 'LOW' && <Trans>Baja</Trans>}
                </span>
              </div> */}
            </TableCell>
            <TableCell onClick={() => onartistClick(artist.id)}>{artist.role || '-'}</TableCell>
            <TableCell onClick={() => onartistClick(artist.id)}>
              {/* {artist.dueDate ? (
                <div className="flex items-center gap-2">
                  <Clock className="text-muted-foreground h-4 w-4" />
                  {new Date(artist.dueDate).toLocaleDateString()}
                </div>
              ) : (
                '-'
              )} */}
            </TableCell>
            <TableCell>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onartistClick(artist.id)}>
                    <Trans>Ver detalles</Trans>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={async () => navigate(`/artists/${artist.id}/edit`)}>
                    <Trans>Editar</Trans>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-red-500"
                    onClick={(e) => {
                      e.stopPropagation();
                      void handleDeleteartist(artist.id);
                    }}
                  >
                    <Trans>Eliminar</Trans>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
