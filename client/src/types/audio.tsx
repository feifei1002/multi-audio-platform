export interface AudioData {
  id: number;
  name: string;
  author: string;
  type?: string;
  description?: string;
  cover?: {
    contentType: string;
    data: string;
  };
}