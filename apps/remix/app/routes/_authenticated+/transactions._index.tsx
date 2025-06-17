// import { json } from '@remix-run/node';
// import { useLoaderData } from '@remix-run/react';
// import { useMatches } from 'react-router';
// import type { Stripe } from 'stripe';

// import { getTransactions } from '@documenso/lib/server-only/stripe';
// import type { findTasks } from '@documenso/lib/server-only/task/find-task';
// import { type Team } from '@documenso/prisma/client';

// import { PaymentsTable } from '~/components/transactions';
// import { appMetaTags } from '~/utils/meta';

// export type TasksPageViewProps = {
//   team?: Team;
//   initialTasks: Awaited<ReturnType<typeof findTasks>>;
// };

// export async function loader() {
//   const payments = await getTransactions();
//   return json({ payments });
// }

// export function meta() {
//   return appMetaTags('Tasks');
// }

// // eslint-disable-next-line @typescript-eslint/require-await
// export default function TransactionsPage() {
//   const { payments } = useLoaderData<typeof loader>();

//   // Adapt Stripe payments to the shape expected by PaymentsTable
//   const adaptedPayments =
//     payments?.data?.map((payment) => ({
//       id: payment.id,
//       amount: payment.amount,
//       currency: payment.currency,
//       status: payment.status,
//       description: payment.description ?? null,
//       created: payment.created,
//     })) ?? [];

//   // Aquí puedes renderizar tu tabla de pagos
//   return (
//     <PaymentsTable
//       payments={adaptedPayments}
//       isLoading={false}
//       isLoadingError={false}
//       onPaymentClick={(id) => console.log(id)}
//     />
//   );
// }

// function useDeepestLoaderData<T>(): { payments: Stripe.ApiList<Stripe.PaymentIntent> } {
//   // Find the deepest matched route with loader data
//   const matches = useMatches();
//   const match = matches[matches.length - 1];
//   return match.data as { payments: Stripe.ApiList<Stripe.PaymentIntent> };
// }
