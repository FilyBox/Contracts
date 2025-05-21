export type CsvRow = Record<string, string>;

export const parseCsvFile = async (file: File): Promise<CsvRow[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split('\n');
        const headers = lines[0].split(',').map((h) => h.trim());

        const result = lines.slice(1).map((line) => {
          const values = line.split(',');
          const obj: CsvRow = {};

          headers.forEach((header, index) => {
            obj[header] = values[index]?.trim() || '';
          });

          return obj;
        });

        resolve(result.filter((item) => Object.values(item).some((val) => val)));
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => {
      reject(new Error('Error al leer el archivo'));
    };

    reader.readAsText(file);
  });
};
