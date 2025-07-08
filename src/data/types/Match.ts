export type Match = {
  wrestlers: number[];
  date: string;
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
