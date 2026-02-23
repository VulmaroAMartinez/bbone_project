import { Scalar, CustomScalar } from '@nestjs/graphql';
import { Kind, ValueNode } from 'graphql';

/**
 * Scalar personalizado para manejar valores JSON en GraphQL.
 * Permite enviar y recibir objetos JSON complejos.
 */
@Scalar('JSON', () => Object)
export class JSONScalar implements CustomScalar<any, any> {
  description = 'JSON custom scalar type';

  parseValue(value: any): any {
    return value; // Valor entrante del cliente
  }

  serialize(value: any): any {
    return value; // Valor saliente hacia el cliente
  }

  parseLiteral(ast: ValueNode): any {
    switch (ast.kind) {
      case Kind.STRING:
        return JSON.parse(ast.value);
      case Kind.OBJECT:
        return this.parseObject(ast);
      case Kind.INT:
        return parseInt(ast.value, 10);
      case Kind.FLOAT:
        return parseFloat(ast.value);
      case Kind.BOOLEAN:
        return ast.value;
      case Kind.LIST:
        return ast.values.map((value) => this.parseLiteral(value));
      case Kind.NULL:
        return null;
      default:
        return null;
    }
  }

  private parseObject(ast: any): any {
    const result: any = {};
    ast.fields.forEach((field: any) => {
      result[field.name.value] = this.parseLiteral(field.value);
    });
    return result;
  }
}
