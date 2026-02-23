import { gql } from '@apollo/client';
import { AREA_BASIC_FRAGMENT, SUB_AREA_BASIC_FRAGMENT } from './fragments';

export const GET_AREAS_QUERY = gql`
  ${AREA_BASIC_FRAGMENT}
  query GetAreas {
    areas {
      ...AreaBasic
    }
  }
`;

export const GET_SUBAREAS_BY_AREA_QUERY = gql`
  ${SUB_AREA_BASIC_FRAGMENT}
  query GetSubAreasByArea($areaId: ID!) {
    subAreasByArea(areaId: $areaId) {
      ...SubAreaBasic
    }
  }
`;