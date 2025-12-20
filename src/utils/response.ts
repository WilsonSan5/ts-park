import { Response } from 'express';
import { ApiSuccessResponse, ApiErrorResponse } from '../types';

export const sendSuccess = <T = unknown>(
  res: Response,
  message: string,
  data?: T
): Response<ApiSuccessResponse<T>> => {
  return res.status(200).json({
    success: true,
    message,
    data,
  });
};

export const sendError = (
  res: Response,
  message: string,
  statusCode: number = 400,
  errors?: Record<string, string[]>
): Response<ApiErrorResponse> => {
  const response: ApiErrorResponse = {
    success: false,
    message,
  };

  // Include validation errors if provided
  if (errors) {
    response.errors = errors;
  }

  return res.status(statusCode).json(response);
};

export const sendCreated = <T = unknown>(
  res: Response,
  message: string,
  data?: T
): Response<ApiSuccessResponse<T>> => {
  return res.status(201).json({
    success: true,
    message,
    data,
  });
};
