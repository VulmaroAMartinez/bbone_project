import { gql } from '@apollo/client';

// ─── Queries de datos del formulario ────────────────────────────────────────

export const GET_MATERIAL_REQUEST_FORM_DATA_QUERY = gql`
  query GetMaterialRequestFormData {
    techniciansActive {
      id
      user {
        id
        fullName
        employeeNumber
      }
      position {
        id
        name
      }
    }
    usersWithDeleted {
      id
      fullName
      employeeNumber
      isActive
      roles {
        id
        name
      }
    }
    machinesActive {
      id
      name
      brand
      model
      manufacturer
      areaId
      area {
        id
        name
      }
      subAreaId
      subArea {
        id
        name
        area {
          id
          name
        }
      }
    }
    materialsActive {
      id
      description
      brand
      model
      partNumber
      sku
      unitOfMeasure
    }
    sparePartsActive {
      id
      partNumber
      brand
      model
      unitOfMeasure
      machineId
    }
  }
`;

// ─── Queries de listado ──────────────────────────────────────────────────────

export const GET_MATERIAL_REQUESTS_QUERY = gql`
  query GetMaterialRequests {
    materialRequestsWithDeleted {
      id
      folio
      category
      priority
      importance
      boss
      isGenericAllowed
      suggestedSupplier
      isActive
      createdAt
      requester {
        id
        fullName
        employeeNumber
      }
      machine {
        id
        name
        code
        areaId
        area {
          id
          name
        }
        subAreaId
        subArea {
          id
          name
        }
      }
      items {
        id
        requestedQuantity
        unitOfMeasure
        description
        customName
        brand
        partNumber
      }
    }
  }
`;

// ─── Query de detalle ─────────────────────────────────────────────────────────

export const GET_MATERIAL_REQUEST_QUERY = gql`
  query GetMaterialRequest($id: ID!) {
    materialRequest(id: $id) {
      id
      folio
      category
      priority
      importance
      boss
      description
      customMachineBrand
      customMachineModel
      customMachineManufacturer
      isGenericAllowed
      suggestedSupplier
      justification
      comments
      isActive
      createdAt
      updatedAt
      requester {
        id
        fullName
        employeeNumber
      }
      machine {
        id
        name
        code
        brand
        model
        manufacturer
        areaId
        area {
          id
          name
          type
        }
        subAreaId
        subArea {
          id
          name
          area {
            id
            name
          }
        }
      }
      items {
        id
        requestedQuantity
        unitOfMeasure
        description
        customName
        brand
        model
        partNumber
        sku
        proposedMaxStock
        proposedMinStock
        materialId
        sparePartId
        material {
          id
          description
          partNumber
          brand
          sku
          unitOfMeasure
        }
        sparePart {
          id
          partNumber
          brand
          model
          unitOfMeasure
        }
      }
    }
  }
`;

// ─── Mutations ────────────────────────────────────────────────────────────────

/**
 * Paso 1: Crear la solicitud SIN items (items: []).
 * Usamos dos pasos para evitar el problema de materialRequestId: ID!
 * en CreateMaterialRequestItemInput, que requiere el ID del padre
 * antes de que exista.
 */
export const CREATE_MATERIAL_REQUEST_MUTATION = gql`
  mutation CreateMaterialRequest($input: CreateMaterialRequestInput!) {
    createMaterialRequest(input: $input) {
      id
      folio
      category
      priority
      importance
      boss
      isGenericAllowed
      createdAt
      requester {
        id
        fullName
      }
      machine {
        id
        name
        code
      }
      items {
        id
      }
    }
  }
`;

/**
 * Paso 2: Agregar cada item con el ID real de la solicitud.
 */
export const ADD_MATERIAL_TO_REQUEST_MUTATION = gql`
  mutation AddMaterialToRequest(
    $materialRequestId: ID!
    $input: CreateMaterialRequestItemInput!
  ) {
    addMaterialToRequest(
      materialRequestId: $materialRequestId
      input: $input
    ) {
      id
      requestedQuantity
      unitOfMeasure
      description
      customName
      brand
      model
      partNumber
      sku
      proposedMaxStock
      proposedMinStock
      materialId
      sparePartId
    }
  }
`;

export const DEACTIVATE_MATERIAL_REQUEST_MUTATION = gql`
  mutation DeactivateMaterialRequest($id: ID!) {
    deactivateMaterialRequest(id: $id)
  }
`;