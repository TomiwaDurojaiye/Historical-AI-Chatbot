import { Request, Response, NextFunction } from 'express';

export const errorHandler = (
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    console.error('Error:', err);

    res.status(500).json({
        error: 'An unexpected error occurred',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
};

export const notFound = (req: Request, res: Response): void => {
    res.status(404).json({
        error: 'Route not found',
    });
};
