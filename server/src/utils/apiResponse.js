export class ApiResponse {
  constructor(statusCode, message = 'Success', data = null, pagination = null) {
    this.statusCode = statusCode;
    this.success = statusCode < 400;
    this.message = message;
    if (data !== null) {
      this.data = data;
    }
    if (pagination !== null) {
      this.pagination = pagination;
    }
  }

  send(res) {
    const payload = {
      success: this.success,
      message: this.message,
    };
    if (this.data !== undefined && this.data !== null) {
      payload.data = this.data;
    }
    if (this.pagination) {
      payload.pagination = this.pagination;
    }
    return res.status(this.statusCode).json(payload);
  }
}

export const successResponse = (res, statusCode = 200, message = 'Success', data = null, pagination = null) => {
  return new ApiResponse(statusCode, message, data, pagination).send(res);
};

