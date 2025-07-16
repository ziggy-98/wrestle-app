export type Title = {
  id: number;
  name: string;
  url: string;
  promotion: number;
  isActive?: boolean;
  activeFrom?: string;
  activeTo?: string;
  reigns: {
    champion: number;
    heldFrom: string;
    heldTo?: string;
  }[];
};
