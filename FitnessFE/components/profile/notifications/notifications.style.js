import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#1a1a1a',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6a0dad',
    marginBottom: 20,
    marginTop: 50,
    textAlign: 'center'
  },
  tabsContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: '#333',
    marginHorizontal: 5,
    borderRadius: 5,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#6a0dad',
  },
  tabText: {
    color: '#fff',
    fontSize: 16,
  },
  activeTabText: {
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noNotificationsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noNotificationsText: {
    color: '#ccc',
    fontSize: 16,
  },
  listContainer: {
    paddingBottom: 20,
  },
  notificationItem: {
    flexDirection: 'row',
    backgroundColor: '#2c2c2c',
    borderRadius: 5,
    padding: 15,
    alignItems: 'center',
    marginBottom: 10,
  },
  readCard: {
    opacity: 1,
  },
  unreadCard: {
    opacity: 1,
  },
  iconContainer: {
    marginRight: 15,
  },
  notificationContent: {
    flex: 1,
  },
  notificationMessage: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 5,
  },
  notificationTimestamp: {
    color: '#aaa',
    fontSize: 12,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    marginLeft: 10,
  },
  acceptButton: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 5,
    marginRight: 5,
  },
  rejectButton: {
    backgroundColor: '#F44336',
    padding: 10,
    borderRadius: 5,
  },
  rowBack: {
    alignItems: 'center',
    backgroundColor: '#ff4d4d',
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingRight: 15,
    borderRadius: 5,
    marginBottom: 11,
    marginLeft: 10
  },
  deleteButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 75,
    height: '100%',
  },
  backTextWhite: {
    color: '#fff',
    marginTop: 5,
  },
});

export default styles;
