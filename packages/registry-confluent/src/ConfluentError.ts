export class ConfluentError extends Error {
  constructor(
    contract: {
      method: string;
      path: string;
    },
    request: {
      params?: { [key: string]: any };
      query?: { [key: string]: any };
      body?: any;
    },
    response: {
      status: number;
      body: { error_code?: number; message?: string } | string | any;
    },
  ) {
    super(
      `[${response.status}${
        response.body.error_code ? `|${response.body.error_code}` : ''
      }]${contract.method} ${contract.path}
      \n   Request:${JSON.stringify(request)}
      \n   Response:${
        response.body.message
          ? response.body.message
          : JSON.stringify(response.body)
      }`,
    );
  }
}
