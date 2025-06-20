export type Match = {
  wrestlers: number[];
  date: Date;
  promotion: {
    id: number;
    name: string;
    url: string;
  };
  event: {
    id: number;
    name: string;
  };
};
