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
    top: 0,
    right: 0,
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
    marginBottom: 20,
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
  actionBar: {
    position: 'absolute',
    bottom: 0,
    width: '125%',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },  
});

export default styles;
