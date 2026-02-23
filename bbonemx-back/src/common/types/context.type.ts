import { Request, Response } from 'express';

/**
 * Usuario autenticado en el contexto.
 * Se popula después de validar el JWT.
 */
export interface ICurrentUser {
  id: string;
  employeeNumber: string;
  firstName: string;
  lastName: string;
  email?: string;
  role: string;
}

/**
 * Request de Express extendido con el usuario autenticado.
 */
export interface IAuthenticatedRequest extends Request {
  user?: ICurrentUser;
}

/**
 * Contexto de GraphQL.
 * Disponible en todos los resolvers.
 */
export interface IGqlContext {
  req: IAuthenticatedRequest;
  res: Response;
}
