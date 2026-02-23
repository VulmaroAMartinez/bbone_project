import { AsyncLocalStorage } from 'async_hooks';

/**
 * Interfaz que define el contexto del usuario en la request.
 * Contiene información necesaria para auditoría y seguimiento.
 */
export interface IUserContext {
  /** UUID del usuario autenticado */
  userId?: string;
  /** Dirección IP del cliente */
  ipAddress?: string;
  /** User agent del navegador/cliente */
  userAgent?: string;
  /** ID de sesión (si existe) */
  sessionId?: string;
  /** Timestamp de inicio de la request */
  requestTimestamp?: Date;
}

/**
 * AsyncLocalStorage para mantener el contexto del usuario
 * a través de toda la ejecución de la request.
 * 
 * Esto permite acceder al contexto del usuario desde cualquier
 * parte del código sin necesidad de pasarlo como parámetro.
 */
export const userContextStorage = new AsyncLocalStorage<IUserContext>();

/**
 * Clase utilitaria para acceder al contexto del usuario actual.
 * Proporciona métodos estáticos para obtener información del usuario
 * sin necesidad de inyección de dependencias.
 */
export class UserContext {
  /**
   * Obtiene el contexto completo del usuario actual.
   * @returns El contexto del usuario o undefined si no existe.
   */
  static getCurrentContext(): IUserContext | undefined {
    return userContextStorage.getStore();
  }

  /**
   * Obtiene el ID del usuario actual.
   * @returns El UUID del usuario o undefined si no está autenticado.
   */
  static getCurrentUserId(): string | undefined {
    return userContextStorage.getStore()?.userId;
  }

  /**
   * Obtiene la dirección IP del cliente actual.
   * @returns La IP del cliente o undefined.
   */
  static getIpAddress(): string | undefined {
    return userContextStorage.getStore()?.ipAddress;
  }

  /**
   * Obtiene el user agent del cliente actual.
   * @returns El user agent o undefined.
   */
  static getUserAgent(): string | undefined {
    return userContextStorage.getStore()?.userAgent;
  }

  /**
   * Obtiene el ID de sesión actual.
   * @returns El ID de sesión o undefined.
   */
  static getSessionId(): string | undefined {
    return userContextStorage.getStore()?.sessionId;
  }

  /**
   * Ejecuta una función dentro de un contexto de usuario específico.
   * Útil para operaciones que necesitan ejecutarse con un contexto particular.
   * 
   * @param context - El contexto de usuario a usar.
   * @param callback - La función a ejecutar dentro del contexto.
   * @returns El resultado de la función callback.
   */
  static run<T>(context: IUserContext, callback: () => T): T {
    return userContextStorage.run(context, callback);
  }

  /**
   * Ejecuta una función asíncrona dentro de un contexto de usuario específico.
   * 
   * @param context - El contexto de usuario a usar.
   * @param callback - La función asíncrona a ejecutar dentro del contexto.
   * @returns Una promesa con el resultado de la función callback.
   */
  static async runAsync<T>(
    context: IUserContext,
    callback: () => Promise<T>,
  ): Promise<T> {
    return userContextStorage.run(context, callback);
  }
}
