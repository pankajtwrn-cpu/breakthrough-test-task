import { Request, Response, NextFunction } from 'express';

export const logger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  const requestId = req.headers['x-request-id'] as string;
  const tenantId = (req as any).user?.tenantId; // Will be populated by auth middleware later

  // Hook into res.on('finish') to log the request once it's done
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logEntry = {
      timestamp: new Date().toISOString(),
      requestId,
      tenantId: tenantId || 'anonymous',
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration: `${duration}ms`,
      userAgent: req.get('user-agent'),
      ip: req.ip,
    };

    console.log(JSON.stringify(logEntry));
  });

  next();
};
