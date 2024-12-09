import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  listContainer: {
    padding: 10,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#ddd',
  },
  notificationTextContainer: {
    flex: 1,
    marginLeft: 10,
  },
  notificationText: {
    fontSize: 16,
    color: '#ccc',
  },
  buttonContainer: {
    flexDirection: 'row',
    marginTop: 5,
  },
  acceptButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    alignItems: 'center',
    marginRight: 10,
  },
  declineButton: {
    backgroundColor: '#f44336',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noNotificationsContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  noNotificationsText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});

export default styles;
