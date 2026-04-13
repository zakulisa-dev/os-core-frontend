enum HackType {
  Mainframe = "mainframe",
  Database = "database",
  Satellite = "satellite",
}

type HackDataType = 'info' | 'progress' | 'success';

interface HackData {
  text: string;
  type: HackDataType;
}

export { HackType };
export type { HackDataType, HackData };
