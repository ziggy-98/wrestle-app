export type Wrestler = {
  id: number;
  name: string;
  url: string;
  details?: {
    birthplace: string;
    gender: string;
    height: string;
    weight: string;
    careerStart: Date;
    careerEnd?: Date;
    roles?: string[];
    nicknames?: string[];
    signatureMoves?: string[];
  };
  career?: Record<number, number[]>;
};
