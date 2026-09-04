export interface IPaginationRequest {
  pageNumber: number;
  pageSize: number;
  search?: string;
  [key: string]: number | string | undefined;
}

export class IPaginationRequestFormValues implements IPaginationRequest {
  pageNumber: number = 1;
  pageSize: number = 10;
  [key: string]: number | string | undefined;

  constructor(values?: IPaginationRequest) {
    Object.assign(this, values);
  }
}

export interface IPaginationResponse<T> {
  data: T[];
  totalCount: number;
}
