export type Promotion = {
  id: number;
  name: string;
  location: string;
  isActive: boolean;
  started: Date;
  finished?: Date;
};
