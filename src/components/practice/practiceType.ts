import { Exercise, TopicSlug, ValidateResponse, Vec3 } from "@/lib/practice/types";

export type TopicValue = TopicSlug | "all";

export type QItem = {
  key: string;
  exercise: Exercise;
  single: string;
  multi: string[];
  num: string;
  dragA: Vec3;
  dragB: Vec3;
  matRows: number;
  matCols: number;
  mat: string[][];
  result: ValidateResponse | null;
  submitted: boolean;
  revealed?: boolean;
  attempts?: number;

  code: string;
  // optional: stdout/stderr or run output panel
  codeRunOutput?: string;
   
  stdin?: string;


  codeStdin: string;
  codeLang: "python" | "java";
};

// export type MissedItem = {
//   id: string;
//   at: number;
//   topic: TopicSlug;
//   kind: Exercise["kind"];
//   title: string;
//   prompt: string;
//   userAnswer: any;
//   expected: any;
//   explanation?: string | null;
// };
export type MissedItem = {
  id: string;
  at: number;
  topic: TopicSlug;
  kind: string;
  title: string;
    publicPayload?: any;

  prompt: string;
  userAnswer: any;
  expected: any;
  explanation?: string | null;
};
