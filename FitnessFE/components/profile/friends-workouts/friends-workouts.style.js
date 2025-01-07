import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#333',
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginBottom: 20,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchBar: {
    flex: 1,
    color: '#fff',
  },
  filteredFriendsList: {
    maxHeight: 150,
    backgroundColor: '#333',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 10,
  },
  friendItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  friendItemText: {
    fontSize: 16,
    color: '#ccc',
  },
  friendImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
    backgroundColor: '#ccc',
  },
  selectedFriendHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  selectedFriendImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
    backgroundColor: '#ccc',
  },
  selectedFriendTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#6a0dad',
    textAlign: 'center',
  },
  workoutCard: {
    backgroundColor: '#333',
    borderRadius: 8,
    padding: 16,
    marginVertical: 5,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  workoutInfo: {
    flexDirection: 'column',
  },
  workoutName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ccc',
  },
  timestamp: {
    fontSize: 14,
    color: '#777',
    marginTop: 4,
  },
  separator: {
    height: 1,
    backgroundColor: '#333',
    marginVertical: 5,
  },
  noWorkoutsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noWorkoutsText: {
    fontSize: 18,
    color: '#888',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noSelectionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noSelectionText: {
    fontSize: 16,
    color: '#888',
  },
});

export default styles;
