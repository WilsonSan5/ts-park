import { Response } from 'express';

export const sendSuccess = (res: Response, message: string, data?: any) => {
  return res.status(200).json({
    success: true,
    message,
    data,
  });
};

export const sendError = (res: Response, message: string, statusCode: number = 400) => {
  return res.status(statusCode).json({
    success: false,
    message,
  });
};

export const sendCreated = (res: Response, message: string, data?: any) => {
  return res.status(201).json({
    success: true,
    message,
    data,
  });
};
