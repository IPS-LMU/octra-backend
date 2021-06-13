export interface OctraProject {
  id: number;
  name: string;
  shortname?: string;
  description?: string;
  configuration?: any;
  startdate?: string;
  enddate?: string;
  active?: boolean;
  admin_id?: number
}
