import { GoogleGenAI, Type } from '@google/genai';
import { TeamMemberRole } from '@prisma/client';
import { task } from '@trigger.dev/sdk/v3';
// Usa la versión asíncrona
import fetch from 'node-fetch';
// Asegúrate de instalarlo con `pnpm add node-fetch`
import { match } from 'ts-pattern';

import { DocumentVisibility } from '@documenso/lib/types/document-visibility';
import { prisma } from '@documenso/prisma';

import { extractText } from '../services/textparser';

export const extractBodyContractTask = task({
  id: 'extract-body-contract',
  queue: {
    concurrencyLimit: 1,
  },
  // Set an optional maxDuration to prevent tasks from running indefinitely
  // Stop executing after 300 secs (5 mins) of compute
  run: async (payload: {
    teamId?: number;
    urlDocument: string;
    userId: number;
    documentId: number;
  }) => {
    const documentId = payload.documentId;
    const teamId = payload.teamId;
    const userId = payload.userId;

    console.log('teamId', teamId);
    console.log(`🔹 Buscando archivo con ID: ${documentId} en la base de datos...`);
    try {
      const decryptedId = payload.documentId;
      console.log(`🔹 Workspace ID: ${decryptedId} y ${payload.documentId}`);
      if (!decryptedId) {
        console.log(`⚠️ No se pudo desencriptar el ID: ${payload.documentId}`);
        return null;
      }
      let teamMemberRole = null;

      if (teamId !== undefined) {
        try {
          const team = await prisma.team.findFirstOrThrow({
            where: {
              id: teamId,
              members: {
                some: {
                  userId,
                },
              },
            },
            include: {
              members: {
                where: {
                  userId,
                },
                select: {
                  role: true,
                },
              },
            },
          });

          teamMemberRole = team.members[0].role;
        } catch (error) {
          console.error('Error finding team:', error);
          return null;
        }
      }

      const visibilityFilters = match(teamMemberRole)
        .with(TeamMemberRole.ADMIN, () => ({
          visibility: {
            in: [
              DocumentVisibility.EVERYONE,
              DocumentVisibility.MANAGER_AND_ABOVE,
              DocumentVisibility.ADMIN,
            ],
          },
        }))
        .with(TeamMemberRole.MANAGER, () => ({
          visibility: {
            in: [DocumentVisibility.EVERYONE, DocumentVisibility.MANAGER_AND_ABOVE],
          },
        }))
        .otherwise(() => ({ visibility: DocumentVisibility.EVERYONE }));
      console.log('visibilityFilters', visibilityFilters);
      const documentWhereClause = {
        id: documentId,
        ...(teamId
          ? {
              OR: [
                // { teamId, ...visibilityFilters },
                { teamId },
              ],
            }
          : { userId, teamId: null }),
      };
      const documentBodyExists = await prisma.documentBodyExtracted.findFirst({
        where: { documentId: documentId },
      });
      console.log('documentBodyExists', documentBodyExists);
      let documentBody;
      if (documentBodyExists) {
        documentBody = documentBodyExists;
      } else {
        documentBody = await prisma.documentBodyExtracted.create({
          data: { body: 'En proceso', status: 'PENDING', documentId: documentId },
        });
      }

      console.log('documentWhereClause', documentWhereClause);

      const document = await prisma.document.findFirst({
        where: documentWhereClause,
      });

      console.log('document', document);

      const pdfUrl = payload.urlDocument;
      console.log(`🔹 Descargando PDF desde: ${pdfUrl}`);

      const response = await fetch(pdfUrl);

      if (!response.ok) {
        console.log(`⚠️ Error al obtener ${pdfUrl}, código HTTP: ${response.status}`);
        throw new Error(`Error al obtener ${pdfUrl}, código HTTP: ${response.status}`);
      }

      const buffer = Buffer.from(await response.arrayBuffer());
      console.log(`✅ PDF descargado con éxito, tamaño: ${buffer.length} bytes`);

      const fileName = document?.title;
      let extractedText;
      // extractedText = await extractText(fileName ?? 'archivo_desconocido', buffer, pdfUrl);

      if (
        documentBody.body &&
        documentBody.body !== 'En proceso' &&
        documentBody.body !== 'Formato no soportado.'
      ) {
        console.log('documentBody.body', documentBody.body);
        if (documentBody.body === 'Formato no soportado.') {
          extractedText = await extractText(fileName ?? 'archivo_desconocido', buffer, pdfUrl);
        } else {
          extractedText = documentBody.body;
        }
      } else {
        extractedText = await extractText(fileName ?? 'archivo_desconocido', buffer, pdfUrl);
      }
      if (!extractedText) {
        console.log(`⚠️ No se pudo extraer el texto del PDF: ${fileName}`);
        await prisma.document.update({
          where: { id: documentId },
          data: { status: 'ERROR' },
        });
        return;
      }

      if (
        extractedText === 'Error al procesar el PDF.' ||
        extractedText === 'Formato no soportado.'
      ) {
        console.log(`⚠️ No se pudo extraer el texto del PDF: ${fileName}`);

        await prisma.document.update({
          where: { id: documentId },
          data: { status: 'ERROR' },
        });
        return;
      }

      console.log(`✅ texto extraido con éxito`);

      if (extractedText) {
        console.log('ai beggining');
        const prompt = `
Extrae la información clave de este contrato en base a los siguientes requerimientos:
el titulo es: ${fileName}
1. **Título del contrato**: Nombre del contrato.
2. **Artistas**: Nombres de todos los artistas involucrados.
3. **Fecha de inicio del contrato**: Fecha de inicio del contrato formato dd/mm/aaaa.
4. **Fecha de finalización del contrato**: Fecha de finalización del contrato formato dd/mm/aaaa.
5. **¿Es posible expandirlo?**: Indica si el contrato puede extenderse (SI, NO, NO_ESPECIFICADO).
6. **Tiempo de extensión posible**: Especifica el tiempo de extensión (2, 3, 5 años o la cantidad de tiempo especificada), fecha estimada.
7. **Estatus del contrato**: Si ya está vencido (FINALIZADO) o es vigente (VIGENTE). Basado en la fecha actual: ${new Date().toISOString()}.
8. **Tipo de Contrato**: Clasifica el contrato como uno de los siguientes: ARRENDAMIENTOS, ALQUILERES, VEHICULOS, SERVICIOS, ARTISTAS.
9. **Periodo de Colección**: Indica si existe un período de Colección específico (SI, NO, NO_ESPECIFICADO).
10. **Descripción del Periodo de Coleccion**: Detalla cómo funciona el período de Colección.
11. **Duración del Periodo de Coleccion**: Especifica la duración del período de Colección.
12. **Periodo de Retención**: Indica si existe un período de retención (SI, NO, NO_ESPECIFICADO).
13. **Descripción del Periodo de Retención**: Detalla cómo funciona el período de retención.
14. **Duración del Periodo de Retención**: Especifica la duración del período de retención.
15. **Resumen general** SIEMPRE genera un resumen del contrato.

este es el contrato: ${extractedText}
        `;

        console.log('prompt', prompt);

        await prisma.documentBodyExtracted.update({
          where: { id: documentBody.id },
          data: { status: 'COMPLETE', body: extractedText },
        });
        await prisma.document.update({
          where: { id: documentId },
          data: { status: 'COMPLETED' },
        });

        const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY });
        // const responses = await ai.models.generateContent({
        //   model: 'gemini-2.0-flash-lite',
        //   contents: prompt,
        //   config: {
        //     responseMimeType: 'application/json',
        //     responseSchema: {
        //       type: Type.ARRAY,
        //       items: {
        //         type: Type.OBJECT,
        //         properties: {
        //           tituloContrato: { type: Type.STRING },
        //           artistas: {
        //             type: Type.ARRAY,
        //             items: {
        //               type: Type.OBJECT,
        //               properties: {
        //                 nombre: { type: Type.STRING },
        //               },
        //             },
        //           },
        //           fechaInicio: { type: Type.STRING },
        //           fechaFin: { type: Type.STRING },
        //           esPosibleExpandirlo: { type: Type.STRING, enum: ['SI', 'NO', 'NO_ESPECIFICADO'] },
        //           tiempoExtensionPosible: { type: Type.STRING },
        //           estatusContrato: {
        //             type: Type.STRING,
        //             enum: ['VIGENTE', 'FINALIZADO', 'NO_ESPECIFICADO'],
        //           },
        //           resumenGeneral: { type: Type.STRING },
        //         },
        //         propertyOrdering: [
        //           'tituloContrato',
        //           'artistas',
        //           'fechaInicio',
        //           'fechaFin',
        //           'esPosibleExpandirlo',
        //           'tiempoExtensionPosible',
        //           'estatusContrato',

        //           'resumenGeneral',
        //         ],
        //       },
        //     },
        //   },
        // });
        const responses = await ai.models.generateContent({
          model: 'gemini-2.0-flash-lite',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  tituloContrato: { type: Type.STRING },
                  artistas: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        nombre: { type: Type.STRING },
                      },
                    },
                  },
                  fechaInicio: { type: Type.STRING },
                  fechaFin: { type: Type.STRING },
                  esPosibleExpandirlo: {
                    type: Type.STRING,
                    enum: ['SI', 'NO', 'NO_ESPECIFICADO'],
                  },
                  tiempoExtensionPosible: { type: Type.STRING },
                  estatusContrato: {
                    type: Type.STRING,
                    enum: ['VIGENTE', 'FINALIZADO', 'NO_ESPECIFICADO'],
                  },
                  tipoContrato: {
                    type: Type.STRING,
                    enum: ['ARRENDAMIENTOS', 'ALQUILERES', 'VEHICULOS', 'SERVICIOS', 'ARTISTAS'],
                  },
                  periodoColeccion: {
                    type: Type.STRING,
                    enum: ['SI', 'NO', 'NO_ESPECIFICADO'],
                  },
                  descripcionPeriodoColeccion: { type: Type.STRING },
                  duracionPeriodoColeccion: { type: Type.STRING },
                  periodoRetencion: {
                    type: Type.STRING,
                    enum: ['SI', 'NO', 'NO_ESPECIFICADO'],
                  },
                  descripcionPeriodoRetencion: { type: Type.STRING },
                  duracionPeriodoRetencion: { type: Type.STRING },
                  resumenGeneral: { type: Type.STRING },
                },
                propertyOrdering: [
                  'tituloContrato',
                  'artistas',
                  'fechaInicio',
                  'fechaFin',
                  'esPosibleExpandirlo',
                  'tiempoExtensionPosible',
                  'estatusContrato',
                  'tipoContrato',
                  'periodoColeccion',
                  'descripcionPeriodoColeccion',
                  'duracionPeriodoColeccion',
                  'periodoRetencion',
                  'descripcionPeriodoRetencion',
                  'duracionPeriodoRetencion',
                  'resumenGeneral',
                ],
              },
            },
          },
        });
        console.log('response', responses.text);

        const parsedResponse = responses.text ? JSON.parse(responses.text)[0] : null; // Parse JSON and get the first item if text exists
        console.log('parsedResponse', parsedResponse);
        let contractsTable;

        const existingContract = await prisma.contract.findFirst({
          where: { documentId: documentId },
        });

        if (existingContract) {
          console.log('Ya existe el contrato, actualizando');
          contractsTable = await prisma.contract.update({
            where: { id: existingContract.id },
            data: {
              documentId: documentId,
              fileName: fileName,
              artists: parsedResponse.artistas
                .map((artist: { nombre: string }) => artist.nombre)
                .join(', '),
              endDate: parsedResponse.fechaFin,
              startDate: parsedResponse.fechaInicio,
              status: parsedResponse.estatusContrato,
              teamId: teamId,
              userId: userId,
              title: parsedResponse.tituloContrato,
              isPossibleToExpand: parsedResponse.esPosibleExpandirlo,
              possibleExtensionTime: parsedResponse.tiempoExtensionPosible,
              contractType: parsedResponse.tipoContrato,
              collectionPeriod: parsedResponse.periodoColeccion,
              collectionPeriodDescription: parsedResponse.descripcionPeriodoColeccion,
              collectionPeriodDuration: parsedResponse.duracionPeriodoColeccion,
              retentionPeriod: parsedResponse.periodoRetencion,
              retentionPeriodDescription: parsedResponse.descripcionPeriodoRetencion,
              retentionPeriodDuration: parsedResponse.duracionPeriodoRetencion,
              summary: parsedResponse.resumenGeneral,
            },
          });
        } else {
          console.log('No existe el contrato, creando uno nuevo');
          contractsTable = await prisma.contract.create({
            data: {
              documentId: documentId,
              fileName: fileName,
              artists: parsedResponse.artistas
                .map((artist: { nombre: string }) => artist.nombre)
                .join(', '),
              endDate: parsedResponse.fechaFin,
              startDate: parsedResponse.fechaInicio,
              teamId: teamId,
              userId: userId,
              status: parsedResponse.estatusContrato,
              title: parsedResponse.tituloContrato,
              isPossibleToExpand: parsedResponse.esPosibleExpandirlo,
              possibleExtensionTime: parsedResponse.tiempoExtensionPosible,
              contractType: parsedResponse.tipoContrato,
              collectionPeriod: parsedResponse.periodoColeccion,
              collectionPeriodDescription: parsedResponse.descripcionPeriodoColeccion,
              collectionPeriodDuration: parsedResponse.duracionPeriodoColeccion,
              retentionPeriod: parsedResponse.periodoRetencion,
              retentionPeriodDescription: parsedResponse.descripcionPeriodoRetencion,
              retentionPeriodDuration: parsedResponse.duracionPeriodoRetencion,
              summary: parsedResponse.resumenGeneral,
            },
          });
          console.log('contractsTable', contractsTable);
        }
        // if (existingContract) {
        //   console.log('Ya existe el contrato, actualizando');
        //   contractsTable = await prisma.contract.update({
        //     where: { id: existingContract.id },
        //     data: {
        //       documentId: documentId,
        //       fileName: fileName,
        //       artists: parsedResponse.artistas
        //         .map((artist: { nombre: string }) => artist.nombre)
        //         .join(', '),
        //       endDate: parsedResponse.fechaFin,
        //       startDate: parsedResponse.fechaInicio,
        //       status: parsedResponse.estatusContrato,
        //       title: parsedResponse.tituloContrato,
        //       isPossibleToExpand: parsedResponse.esPosibleExpandirlo,
        //       possibleExtensionTime: parsedResponse.tiempoExtensionPosible,
        //       summary: parsedResponse.resumenGeneral,
        //     },
        //   });
        // } else {
        //   console.log('No existe el contrato, creando uno nuevo');
        //   contractsTable = await prisma.contract.create({
        //     data: {
        //       documentId: documentId,
        //       fileName: fileName,
        //       artists: parsedResponse.artistas
        //         .map((artist: { nombre: string }) => artist.nombre)
        //         .join(', '),
        //       endDate: parsedResponse.fechaFin,
        //       startDate: parsedResponse.fechaInicio,
        //       status: parsedResponse.estatusContrato,
        //       title: parsedResponse.tituloContrato,
        //       isPossibleToExpand: parsedResponse.esPosibleExpandirlo,
        //       possibleExtensionTime: parsedResponse.tiempoExtensionPosible,
        //       summary: parsedResponse.resumenGeneral,
        //     },
        //   });
        //   console.log('contractsTable', contractsTable);
        // }
      }
    } catch (error) {
      console.log('Error procesando el PDF:', error);
      console.error('Error procesando el PDF:', error);
      await prisma.document.update({
        where: { id: documentId },
        data: { status: 'ERROR' },
      });
    }
  },
});

// export const helloWorldTask = task({
//   id: "hello-world",
//   // Set an optional maxDuration to prevent tasks from running indefinitely
//   // Stop executing after 300 secs (5 mins) of compute
//   run: async (payload: { fileId: number, workspaceId: string }) => {

//     console.log(`🔹 Buscando archivo con ID: ${payload.fileId} en la base de datos...`);
//   const decryptedId = await decryptId(payload.workspaceId);
//   console.log(`🔹 Workspace ID: ${decryptedId} y ${payload.workspaceId}`);
//   if (!decryptedId) {
//     console.log(`⚠️ No se pudo desencriptar el ID: ${payload.workspaceId}`);
//     return null;
//   }

//   console.log(`🔹 Workspace ID: ${decryptedId}`);

//   // Obtener el archivo desde la base de datos
//   const file = await db
//     .select()
//     .from(files)
//     .where(eq(files.id, payload.fileId))
//     .then((res) => res[0]);

//   if (!file) {
//     console.log(`⚠️ No se encontró un archivo con ID: ${payload.fileId}`);
//     return null;
//   }
//   if (!file.url) {
//     console.log(`⚠️ El archivo ${file.name || "desconocido"} no tiene URL, se omite.`);
//     return null;
//   }

//     const report =  await createReport({name: file.name,
//       body: "Procesando archivo...",
//       workspacesId: Number(decryptedId),
//       status:"En proceso"
//     });

//     if(!report){
//       console.log(`⚠️ No se pudo crear el reporte para el archivo con ID: ${payload.fileId}`);
//       return null;
//     }

//   try {
//     console.log(`📥 Descargando archivo: ${file.url}`);
//     const response = await fetch(file.url);

//     if (!response.ok) {
//       throw new Error(`Error al obtener ${file.url}, código HTTP: ${response.status}`);
//     }

//     const buffer = Buffer.from(await response.arrayBuffer());
//     message:`✅ Archivo ${file.name} descargado con éxito.`;

//     // Asegurar que la carpeta 'downloads' existe
//     await ensureDownloadDir();

//     // Guardar el archivo localmente
//     const tempPath = path.join(downloadsDir, file.name ?? "archivo_desconocido");
//     await fs.writeFile(tempPath, buffer);
//     message:`📂 Archivo guardado temporalmente en: ${tempPath}`;

//     const extractedText = await extractText(file.name ?? "archivo_desconocido", buffer, file.url);
//     if (!extractedText) {
//       console.log(`⚠️ No se pudo extraer el texto del archivo: ${file.name}`);
//       await db.update(reports)
//         .set({ body: "No se pudo extraer el texto", status: "Error" })
//         .where(eq(reports.id, report.id));
//       return null;
//     }
//     // Generar resumen con IA
//     const summary = await summarizeText(extractedText);
//     message: `📄 Resumen generado para ${file.name}:`;

//     // Insertar resumen en la base de datos
//     await db.update(reports)
//       .set({ body: summary, status: "Completado" })
//       .where(eq(reports.id, report.id));

//     message: summary;

//     return {
//       fileId: payload.fileId,
//       fileName: file.name,
//       summary,
//     };
//   } catch (error) {
//     message:`❌ Error procesando ${file.url}:`;
//       await db.update(reports)
//       .set({ body: "No fue posible crear el reporte", status: "Error" })
//       .where(eq(reports.id, report.id));
//     return null;
//   }

//   },
// });
