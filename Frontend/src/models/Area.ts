export type Area = {
  id: number;
  name: string;
  description?: string | null;
  polygonGeoJson: string;
  areaAdminUserId?: string | null;
  areaAdminName?: string | null;
};
