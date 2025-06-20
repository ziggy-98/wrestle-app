export type Title = {
  id: number;
  name: string;
  url: string;
  promotion: string;
  isActive?: boolean;
  activeFrom?: string;
  activeTo?: string;
  reigns: {
    champion: number;
    heldFrom?: Date;
    heldTo?: Date;
  }[];
};
