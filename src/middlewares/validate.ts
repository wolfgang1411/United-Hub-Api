import { NextFunction, Request, Response } from "express";
import { ZodTypeAny } from "zod";
import { HttpError } from "./error";

export function validateBody(schema: ZodTypeAny) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      throw new HttpError(
        400,
        parsed.error.issues.map((issue) => issue.message).join(", "),
      );
    }

    req.body = parsed.data;
    next();
  };
}

export function validateQuery(schema: ZodTypeAny) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const parsed = schema.safeParse(req.query);
    if (!parsed.success) {
      throw new HttpError(
        400,
        parsed.error.issues.map((issue) => issue.message).join(", "),
      );
    }

    req.query = parsed.data as Request["query"];
    next();
  };
}
