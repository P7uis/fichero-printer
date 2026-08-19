import { dsvFormat, type DSVRowArray } from "d3-dsv";

export const CSV_DEFAULT_DELIMITER = ",";

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

export const parseCsvData = (data: string, delimiter?: string): DSVRowArray<string> => {
  const parser = dsvFormat(normalizeCsvDelimiter(delimiter));
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
