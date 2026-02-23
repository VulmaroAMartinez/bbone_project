import { gql } from '@apollo/client';

export const NOTIFICATION_ITEM_FRAGMENT = gql`
  fragment NotificationItem on Notification {
    id
    title
    body
    type
    readAt
    createdAt
    data
  }
`;

export const MY_NOTIFICATIONS_QUERY = gql`
  ${NOTIFICATION_ITEM_FRAGMENT}
  query MyNotifications($limit: Int, $page: Int, $unreadOnly: Boolean) {
    myNotifications(
      pagination: { limit: $limit, page: $page }
      filters: { unreadOnly: $unreadOnly }
    ) {
      data {
        ...NotificationItem
      }
      unreadCount
      total
      totalPages
    }
  }
`;

export const MARK_NOTIFICATION_READ_MUTATION = gql`
  mutation MarkNotificationAsRead($id: ID!) {
    markNotificationAsRead(id: $id) {
      id
      readAt
    }
  }
`;

export const MARK_ALL_NOTIFICATIONS_READ_MUTATION = gql`
  mutation MarkAllNotificationsAsRead {
    markAllNotificationsAsRead
  }
`;