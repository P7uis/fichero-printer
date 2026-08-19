import { dsvFormat, type DSVRowArray } from "d3-dsv";

export const CSV_DEFAULT_DELIMITER = ",";
export const CSV_HEADERLESS_ALIASES = ["name", "class"];

export const normalizeCsvDelimiter = (delimiter?: string): string => {
  if (delimiter === undefined || delimiter === "") {
    return CSV_DEFAULT_DELIMITER;
  }

  if (delimiter === "\\t" || delimiter.toLowerCase() === "tab") {
    return "\t";
  }

  return Array.from(delimiter)[0] ?? CSV_DEFAULT_DELIMITER;
};

export const cleanCsvCell = (value: string): string => {
  const trimmed = value.trim();
  const first = trimmed[0];
  const last = trimmed[trimmed.length - 1];

  if (trimmed.length >= 2 && ((first === "\"" && last === "\"") || (first === "'" && last === "'"))) {
    return trimmed.slice(1, -1).replaceAll(`${first}${first}`, first);
  }

  return trimmed;
};

export const parseCsvData = (data: string, delimiter?: string, hasHeader: boolean = true): DSVRowArray<string> => {
  const parser = dsvFormat(normalizeCsvDelimiter(delimiter));

  if (!hasHeader) {
    const rows = parser.parseRows(data, (row) => row.map(cleanCsvCell)).filter((row) => row.length > 0);
    const columnCount = Math.max(0, ...rows.map((row) => row.length));
    const columns = Array.from({ length: columnCount }, (_, index) => `col${index + 1}`);
    const aliases = CSV_HEADERLESS_ALIASES.slice(0, columnCount);
    const normalized: DSVRowArray<string> = Object.assign([], { columns: [...columns, ...aliases] });

    for (const row of rows) {
      const cleanRow: Record<string, string> = {};

      columns.forEach((column, index) => {
        cleanRow[column] = row[index] ?? "";
      });

      aliases.forEach((alias, index) => {
        cleanRow[alias] = row[index] ?? "";
      });

      normalized.push(cleanRow);
    }

    return normalized;
  }

  const parsed = parser.parse(data);
  const columns = parsed.columns.map(cleanCsvCell);
  const normalized: DSVRowArray<string> = Object.assign([], { columns });

  for (const row of parsed) {
    const cleanRow: Record<string, string> = {};

    parsed.columns.forEach((sourceColumn, index) => {
      cleanRow[columns[index]] = cleanCsvCell(row[sourceColumn] ?? "");
    });

    normalized.push(cleanRow);
  }

  return normalized;
};
