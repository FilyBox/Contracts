// import { useEffect } from 'react';
// import { Trans } from '@lingui/react/macro';
// import { Bird, Loader2, MoreVertical } from 'lucide-react';
// import { useNavigate } from 'react-router';
// import { formLpmPath } from '@documenso/lib/utils/teams';
// import { trpc } from '@documenso/trpc/react';
// import { Button } from '@documenso/ui/primitives/button';
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
// } from '@documenso/ui/primitives/dropdown-menu';
// import { ArtistCreateDialog } from '~/components/dialogs/artist-create-dialog';
// import { EventCreateDialog } from '~/components/dialogs/event-create-dialog';
// import { WrittersCreateDialog } from '~/components/dialogs/writters-create-dialog';
// import { LpmTable } from '~/components/lists/lpm-list';
// import { useOptionalCurrentTeam } from '~/providers/team';
// import { appMetaTags } from '~/utils/meta';
// export function meta() {
//   return appMetaTags('Lpm');
// }
// export default function LpmPage() {
//   const navigate = useNavigate();
//   const team = useOptionalCurrentTeam();
//   const lpmRootPath = formLpmPath(team?.url);
//   const { data, isLoading, isError, refetch } = trpc.lpm.findLpm.useQuery();
//   useEffect(() => {
//     void refetch();
//   }, [team?.url]);
//   const handleTaskClick = (lpmId: number) => {
//     void navigate(`${lpmRootPath}/${lpmId}`);
//   };
//   return (
//     <div className="mx-auto max-w-screen-xl px-4 md:px-8">
//       <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
//         <div className="flex gap-4 sm:flex-row sm:justify-end">
//           <DropdownMenu>
//             <DropdownMenuTrigger asChild>
//               <Button variant="ghost" size="sm">
//                 <MoreVertical className="h-4 w-4" />
//               </Button>
//             </DropdownMenuTrigger>
//             <DropdownMenuContent className="gap-2" align="end">
//               <DropdownMenuItem className="m-1" asChild>
//                 <ArtistCreateDialog />
//               </DropdownMenuItem>
//               <DropdownMenuItem asChild>
//                 <EventCreateDialog />
//               </DropdownMenuItem>
//               <DropdownMenuItem asChild>
//                 <WrittersCreateDialog />
//               </DropdownMenuItem>
//             </DropdownMenuContent>
//           </DropdownMenu>
//           {/* <SongCreateDialog />
//           <ArtistCreateDialog />
//           <EventCreateDialog />
//           <WrittersCreateDialog /> */}
//         </div>
//       </div>
//       {/* ...header y avatar igual... */}
//       <div className="mt-8">
//         {isLoading ? (
//           <div className="flex h-64 items-center justify-center">
//             <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
//           </div>
//         ) : isError ? (
//           <div className="flex h-64 items-center justify-center text-red-500">
//             <Trans>Error al cargar las canciones</Trans>
//           </div>
//         ) : data && data.music.length === 0 ? (
//           <div className="text-muted-foreground/60 flex h-96 flex-col items-center justify-center gap-y-4">
//             <Bird className="h-12 w-12" strokeWidth={1.5} />
//             <div className="text-center">
//               <h3 className="text-lg font-semibold">
//                 <Trans>No hay canciones</Trans>
//               </h3>
//               <p className="mt-2 max-w-[50ch]">
//                 <Trans>No has creado ninguna canción todavía. Crea una nueva para comenzar.</Trans>
//               </p>
//             </div>
//           </div>
//         ) : (
//           <LpmTable
//             lpm={(data?.music || []).map((item) => ({
//               ...item,
//               productVersion: item.productVersion ?? '',
//               parentLabel: item.parentLabel ?? '',
//               upc: item.upc ?? '',
//               isrc: item.isrc ?? '',
//               originalReleaseDate: item.originalReleaseDate ?? '',
//               trackPlayLink: item.trackPlayLink ?? '',
//               productPriceTier: item.productPriceTier ?? '',
//               continuouslyMixedIndividualSong: item.continuouslyMixedIndividualSong ?? '',
//               preOrderDate: item.preOrderDate ?? '',
//               continuousMix: item.continuousMix ?? '',
//               productId: item.productId ?? '',
//               productType: item.productType ?? '',
//               productTitle: item.productTitle ?? '',
//               productPlayLink: item.productPlayLink ?? '',
//               trackName: item.trackName ?? '',
//             }))}
//             isLoading={isLoading}
//             isLoadingError={isError}
//             onlpmClick={handleTaskClick}
//             refetch={async () => {
//               await refetch();
//             }}
//           />
//         )}
//       </div>
//     </div>
//   );
// }

// import { useEffect } from 'react';

// import { Trans } from '@lingui/react/macro';
// import { Bird, Loader2 } from 'lucide-react';
// import { MoreVertical } from 'lucide-react';
// import { useNavigate } from 'react-router';

// import { formLpmPath } from '@documenso/lib/utils/teams';
// import { trpc } from '@documenso/trpc/react';
// import { Button } from '@documenso/ui/primitives/button';
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
// } from '@documenso/ui/primitives/dropdown-menu';

// import { ArtistCreateDialog } from '~/components/dialogs/artist-create-dialog';
// import { EventCreateDialog } from '~/components/dialogs/event-create-dialog';
// import { WrittersCreateDialog } from '~/components/dialogs/writters-create-dialog';
// import { LpmTable } from '~/components/lists/lpm-list';
// import { useOptionalCurrentTeam } from '~/providers/team';
// import { appMetaTags } from '~/utils/meta';

// export function meta() {
//   return appMetaTags('Lpm');
// }

// export default function LpmPage() {
//   const navigate = useNavigate();
//   const team = useOptionalCurrentTeam();
//   const lpmRootPath = formLpmPath(team?.url);
//   const { data, isLoading, isError, refetch } = trpc.lpm.findLpm.useQuery();

//   useEffect(() => {
//     void refetch();
//   }, [team?.url]);

//   const handleTaskClick = (lpmId: number) => {
//     void navigate(`${lpmRootPath}/${lpmId}`);
//   };

//   return (
//     <div className="mx-auto max-w-screen-xl px-4 md:px-8">
//       <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
//         <div className="flex gap-4 sm:flex-row sm:justify-end">
//           <DropdownMenu>
//             <DropdownMenuTrigger asChild>
//               <Button variant="ghost" size="sm">
//                 <MoreVertical className="h-4 w-4" />
//               </Button>
//             </DropdownMenuTrigger>
//             <DropdownMenuContent className="gap-2" align="end">
//               <DropdownMenuItem className="m-1" asChild>
//                 <ArtistCreateDialog />
//               </DropdownMenuItem>
//               <DropdownMenuItem asChild>
//                 <EventCreateDialog />
//               </DropdownMenuItem>
//               <DropdownMenuItem asChild>
//                 <WrittersCreateDialog />
//               </DropdownMenuItem>
//             </DropdownMenuContent>
//           </DropdownMenu>
//         </div>
//       </div>
//       {/* ...header y avatar igual... */}
//       <div className="mt-8">
//         {isLoading ? (
//           <div className="flex h-64 items-center justify-center">
//             <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
//           </div>
//         ) : isError ? (
//           <div className="flex h-64 items-center justify-center text-red-500">
//             <Trans>Error al cargar las canciones</Trans>
//           </div>
//         ) : data && data.length === 0 ? (
//           <div className="text-muted-foreground/60 flex h-96 flex-col items-center justify-center gap-y-4">
//             <Bird className="h-12 w-12" strokeWidth={1.5} />
//             <div className="text-center">
//               <h3 className="text-lg font-semibold">
//                 <Trans>No hay canciones</Trans>
//               </h3>
//               <p className="mt-2 max-w-[50ch]">
//                 <Trans>No has creado ninguna canción todavía. Crea una nueva para comenzar.</Trans>
//               </p>
//             </div>
//           </div>
//         ) : (
//           <LpmTable
//             lpm={(data || []).map((item) => ({
//               ...item,
//               productVersion: item.productVersion ?? '',
//               parentLabel: item.parentLabel ?? '',
//               upc: item.upc ?? '',
//               isrc: item.isrc ?? '',
//               originalReleaseDate: item.originalReleaseDate ?? '',
//               trackPlayLink: item.trackPlayLink ?? '',
//               productPriceTier: item.productPriceTier ?? '',
//               continuouslyMixedIndividualSong: item.continuouslyMixedIndividualSong ?? '',
//               preOrderDate: item.preOrderDate ?? '',
//               continuousMix: item.continuousMix ?? '',
//               productId: item.productId ?? '',
//               productType: item.productType ?? '',
//               productTitle: item.productTitle ?? '',
//               productPlayLink: item.productPlayLink ?? '',
//               trackName: item.trackName ?? '',
//             }))}
//             isLoading={isLoading}
//             isLoadingError={isError}
//             onlpmClick={handleTaskClick}
//             refetch={async () => {
//               await refetch();
//             }}
//           />
//         )}
//       </div>
//     </div>
//   );
// }
