import { Trans } from '@lingui/react/macro';
import { Loader2, MoreVertical } from 'lucide-react';

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

export const PaymentsTable = ({
  payments,
  isLoading,
  isLoadingError,
  onPaymentClick,
}: {
  payments: Array<{
    id: string;
    amount: number;
    currency: string;
    status: string;
    description: string | null;
    created: number;
  }>;
  isLoading: boolean;
  isLoadingError: boolean;
  onPaymentClick: (paymentId: string) => void;
}) => {
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
        <Trans>Error al cargar los pagos</Trans>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>ID</TableHead>
          <TableHead>
            <Trans>Monto</Trans>
          </TableHead>
          <TableHead>
            <Trans>Moneda</Trans>
          </TableHead>
          <TableHead>
            <Trans>Estado</Trans>
          </TableHead>
          <TableHead>
            <Trans>Descripción</Trans>
          </TableHead>
          <TableHead>
            <Trans>Fecha</Trans>
          </TableHead>
          <TableHead>
            <Trans>Acciones</Trans>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {payments.map((payment) => (
          <TableRow key={payment.id} className="hover:bg-muted/50 cursor-pointer">
            <TableCell onClick={() => onPaymentClick(payment.id)}>{payment.id}</TableCell>
            <TableCell onClick={() => onPaymentClick(payment.id)}>
              {(payment.amount / 100).toFixed(2)}
            </TableCell>
            <TableCell onClick={() => onPaymentClick(payment.id)}>
              {payment.currency.toUpperCase()}
            </TableCell>
            <TableCell onClick={() => onPaymentClick(payment.id)}>{payment.status}</TableCell>
            <TableCell onClick={() => onPaymentClick(payment.id)}>
              {payment.description || '-'}
            </TableCell>
            <TableCell onClick={() => onPaymentClick(payment.id)}>
              {new Date(payment.created * 1000).toLocaleDateString()}
            </TableCell>
            <TableCell>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onPaymentClick(payment.id)}>
                    <Trans>Ver detalles</Trans>
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
