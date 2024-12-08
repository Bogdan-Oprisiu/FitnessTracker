import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  mainContent: {
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: '#000',
    marginTop: -100
  },
  header: {
    position: 'absolute',
    top: 30,
    width: '90%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    gap: 30,
    marginTop: 25
  },
  headerRight: {
    flexDirection: 'row',
  },
  headerIcon: {
    marginLeft: 40,
  },
  badge: {
    position: 'absolute',
    right: -6,
    top: -3,
    backgroundColor: '#ff3b30',
    borderRadius: 8,
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'visible'
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  profilePictureContainer: {
    position: 'relative',
    marginBottom: 15,
    marginTop: 100
  },
  profilePicture: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderColor: '#6a0dad',
    borderWidth: 3,
  },
  editIcon: {
    position: 'absolute',
    bottom: 10,
    right: 5,
    backgroundColor: '#6a0dad',
    borderRadius: 20,
    padding: 5,
  },
  username: {
    fontSize: 24,
    color: '#fff',
    fontWeight: '700',
    marginBottom: 15,
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 8,
    width: '90%',
    marginBottom: 20,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchBar: {
    flex: 1,
    color: '#fff',
  },
  friendsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6a0dad',
    paddingVertical: 7,
    paddingHorizontal: 20,
    borderRadius: 25,
    marginBottom: 20,
    top: -5
  },
  friendsText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
  recentActivityContainer: {
    width: '90%',
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    marginBottom: 20,
  },
  recentActivityTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#6a0dad',
    marginBottom: 10,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  activityTextContainer: {
    marginLeft: 15,
  },
  activityText: {
    fontSize: 16,
    color: '#fff',
  },
  activityTimestamp: {
    fontSize: 12,
    color: '#999',
  },
  noActivitiesText: {
    textAlign: 'center',
    color: '#999',
    marginTop: 10,
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    backgroundColor: '#222',
    borderRadius: 20,
    padding: 20,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 15,
    textAlign: 'center',
    color: '#6a0dad',
  },
  modalSearchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginBottom: 15,
  },
  modalSearchIcon: {
    marginRight: 10,
  },
  modalSearchBar: {
    flex: 1,
    color: '#fff',
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    padding: 10,
    borderRadius: 15,
    marginBottom: 10,
  },
  searchResultImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#6a0dad',
    marginRight: 15,
  },
  searchResultName: {
    flex: 1,
    fontSize: 18,
    color: '#fff',
  },
  dropdown: {
    position: 'absolute',
    top: 400,
    width: '90%',
    backgroundColor: '#1a1a1a',
    borderRadius: 10,
    maxHeight: 200,
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  dropdownImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#6a0dad',
  },
  dropdownText: {
    color: '#fff',
    fontSize: 16,
  },
  noUsersText: {
    color: '#ccc',
    textAlign: 'center',
    padding: 10,
  },
  addButton: {
    backgroundColor: '#6a0dad',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 15,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  searchResultsList: {
    width: '90%',
    maxHeight: 300
  },
  addButton: {
    backgroundColor: '#6a0dad',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 15,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  friendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  friendImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#6a0dad',
    marginRight: 15,
  },
  friendName: {
    fontSize: 18,
    color: '#ccc',
  },
  noResultsText: {
    textAlign: 'center',
    color: '#ccc',
    marginBottom: 10,
  },
  closeButton: {
    marginTop: 10,
    backgroundColor: '#6a0dad',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default styles;
