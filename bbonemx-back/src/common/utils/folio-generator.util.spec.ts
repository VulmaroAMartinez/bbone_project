import { FolioGenerator } from './folio-generator.util';

describe('FolioGenerator', () => {
  const fixedDate = new Date(2026, 0, 8); // 2026-01-08

  describe('generateWorkOrderFolio', () => {
    it('genera folio con prefijo OT', () => {
      const folio = FolioGenerator.generateWorkOrderFolio(1, fixedDate);
      expect(folio).toBe('OT-260108-001');
    });

    it('formatea índice a 3 dígitos', () => {
      expect(FolioGenerator.generateWorkOrderFolio(42, fixedDate)).toBe(
        'OT-260108-042',
      );
    });
  });

  describe('generateFindingFolio', () => {
    it('genera folio con prefijo H', () => {
      expect(FolioGenerator.generateFindingFolio(5, fixedDate)).toBe(
        'H-260108-005',
      );
    });
  });

  describe('generateMaterialRequestFolio', () => {
    it('genera folio con prefijo PLT', () => {
      expect(FolioGenerator.generateMaterialRequestFolio(10, fixedDate)).toBe(
        'PLT-260108-010',
      );
    });
  });

  describe('parseFolio', () => {
    it('parsea un folio válido', () => {
      const result = FolioGenerator.parseFolio('OT-260108-001');
      expect(result).toEqual({ prefix: 'OT', date: '260108', index: 1 });
    });

    it('retorna null para folio inválido', () => {
      expect(FolioGenerator.parseFolio('INVALIDO')).toBeNull();
    });
  });
});
