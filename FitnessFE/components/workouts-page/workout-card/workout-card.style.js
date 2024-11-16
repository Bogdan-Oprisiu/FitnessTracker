import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  cardContainer: {
    flex: 1,
    borderRadius: 10,
    overflow: 'hidden',
  },
  gradientBackground: {
    flex: 1,
    padding: 15,
    justifyContent: 'space-between',
  },
  iconContainer: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  iconsOverlay: {
    position: 'absolute',
    top: 10,
    left: 10,
    flexDirection: 'row',
    gap: 10,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
    marginRight: 20
  },
  cardDetails: {
    fontSize: 14,
    color: '#e0e0e0',
  },
  starsContainer: {
      flexDirection: 'row',
    },
    star: {
      marginRight: 3,
      marginTop: 3
    },
});

export default styles;
