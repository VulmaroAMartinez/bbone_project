import { SetMetadata } from '@nestjs/common';
import { METADATA_KEYS } from '../constants';

/**
 * Decorador que marca un resolver o método como público.
 * Los endpoints marcados con @Public() no requieren autenticación JWT.
 * 
 * @example
 * @Public()
 * @Query()
 * health() {
 *   return { status: 'ok' };
 * }
 * 
 * @example
 * @Public()
 * @Mutation()
 * login(@Args('input') input: LoginInput) {
 *   // ...
 * }
 */
export const Public = () => SetMetadata(METADATA_KEYS.IS_PUBLIC, true);
