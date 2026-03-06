import { gql } from '@apollo/client';

export const GET_MATERIAL_REQUEST_FORM_DATA_QUERY = gql`
  query GetMaterialRequestFormData {
    machinesActive {
      id
      name
      code
      subAreaId
      subArea {
        id
        name
      }
    }
    materialsActive {
      id
      description
      partNumber
      sku
      brand
      unitOfMeasure
      isActive
    }
    usersWithDeleted {
      id
      fullName
      employeeNumber
      isActive
      role {
        id
        name
      }
    }
  }
`;

export const GET_MATERIAL_REQUESTS_QUERY = gql`
  query GetMaterialRequests {
    materialRequestsWithDeleted {
      id
      folio
      priority
      requestText
      comments
      justification
      isGenericOrAlternativeModel
      suggestedSupplier
      isActive
      createdAt
      machine {
        id
        name
        code
        subAreaId
        subArea {
          id
          name
        }
      }
      materials {
        id
        quantity
        importance
        minimumStock
        maximumStock
        material {
          id
          description
          partNumber
          brand
          unitOfMeasure
        }
      }
    }
  }
`;

export const GET_MATERIAL_REQUEST_QUERY = gql`
  query GetMaterialRequest($id: ID!) {
    materialRequest(id: $id) {
      id
      folio
      priority
      requestText
      comments
      justification
      isGenericOrAlternativeModel
      suggestedSupplier
      isActive
      createdAt
      machine {
        id
        name
        code
      }
      materials {
        id
        quantity
        importance
        minimumStock
        maximumStock
        material {
          id
          description
          partNumber
          brand
          model
          sku
          unitOfMeasure
        }
      }
    }
  }
`;

export const CREATE_MATERIAL_REQUEST_MUTATION = gql`
  mutation CreateMaterialRequest($input: CreateMaterialRequestInput!) {
    createMaterialRequest(input: $input) {
      id
      folio
      priority
      requestText
      createdAt
      machine {
        id
        name
        code
      }
    }
  }
`;

export const UPDATE_MATERIAL_REQUEST_MUTATION = gql`
  mutation UpdateMaterialRequest($id: ID!, $input: UpdateMaterialRequestInput!) {
    updateMaterialRequest(id: $id, input: $input) {
      id
      folio
      priority
      requestText
      comments
      justification
      isGenericOrAlternativeModel
      suggestedSupplier
      updatedAt
    }
  }
`;

export const ADD_MATERIAL_TO_REQUEST_MUTATION = gql`
  mutation AddMaterialToRequest($materialRequestId: ID!, $input: AddMaterialToRequestInput!) {
    addMaterialToRequest(materialRequestId: $materialRequestId, input: $input) {
      id
      quantity
      importance
      minimumStock
      maximumStock
      materialId
      materialRequestId
    }
  }
`;

export const REMOVE_MATERIAL_FROM_REQUEST_MUTATION = gql`
  mutation RemoveMaterialFromRequest($materialRequestMaterialId: ID!) {
    removeMaterialFromRequest(materialRequestMaterialId: $materialRequestMaterialId)
  }
`;

export const DEACTIVATE_MATERIAL_REQUEST_MUTATION = gql`
  mutation DeactivateMaterialRequest($id: ID!) {
    deactivateMaterialRequest(id: $id)
  }
`;
