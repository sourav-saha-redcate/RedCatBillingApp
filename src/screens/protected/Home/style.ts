import { Colors, Fonts } from "@app/themes";
import { normalize } from "@app/utils/orientation";
import { Dimensions, Platform, StyleSheet } from "react-native";
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const styles = StyleSheet.create({
   dot: {
    borderRadius: normalize(10),
    marginHorizontal: normalize(2),
  },
  flexView: {
    flexDirection: 'row',
    alignItems: 'center',
  },
    scrollView: {
    paddingBottom: Platform.OS == 'android' ? normalize(80) : normalize(150),
  },
  subtitleText: {
    fontSize: normalize(12),
    color: Colors.white,
    fontFamily: Fonts.Figtree_Regular,
    marginTop: normalize(5),
  },
   textContainer: {
    paddingHorizontal: normalize(20),
    paddingVertical: normalize(25),
  },
   container2: {
    marginTop:normalize(12),
    flexDirection: 'row',
     alignItems: 'center',
     justifyContent:'space-between'
  },
  flatListContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
     imageStyle: {
    borderRadius: normalize(20),
  },
     rendercontainer1: {
      marginTop:normalize(18),
     height: normalize(200),
    width: '100%',
    justifyContent: 'flex-end',
  },
  rendercontainer2: {
      marginTop:normalize(12),
     height: normalize(165),
    width: '100%',
    justifyContent: 'flex-end',
  },
  container: {
    marginTop: Platform.OS === 'android' ? normalize(10) : normalize(45),
    marginHorizontal: normalize(12),
    flex:1
  },
    container1: {
    flexDirection: 'row',
  },
leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginEnd:normalize(12)

  },
  notificationIcon: {
    width: normalize(42),
    height: normalize(42),
  },
   notiback: {
    borderRadius: normalize(20),
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardContainer: {
    width: '32%',
    height: normalize(109),
    backgroundColor: '#FFFFFF',
    borderRadius: normalize(18),
    alignItems: 'flex-start',
    justifyContent: 'center',
    borderColor:'#F6F6F6',
    shadowColor: '#C4D5E640',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 3,
    marginEnd:normalize(4),
    borderWidth:normalize(2),
    paddingRight:normalize(5)
  },
 cardContainer1: {
    width: normalize(120),
    height: normalize(121),
    backgroundColor: '#FFFFFF',
    borderRadius: normalize(18),
    alignItems: 'flex-start',
    justifyContent: 'center',
    borderColor:'#F6F6F6',
    shadowColor: '#C4D5E640',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 3,
    borderWidth:normalize(2)
  },
  icon: {
    width: normalize(23),
    height: normalize(23),
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    marginStart:normalize(15),
    tintColor: Colors.button_color,
    marginBottom:normalize(14) // your dark maroon shade
  },
  titleText: {
    fontSize: normalize(13),
    color: '#656769',
    textAlign: 'left',
    fontFamily:Fonts.Figtree_Medium,
     marginStart:normalize(15)
  },
  titleText1: {
    fontSize: normalize(22),
    color: Colors.white,
    fontFamily: Fonts.DMSans_18pt_SemiBold,
    lineHeight: normalize(24),
  },
   titleText2: {
    fontSize: normalize(16),
    color: '#1B1C1E',
    textAlign: 'center',
  marginTop:normalize(13),
    fontFamily:Fonts.Figtree_Medium,
    marginLeft:normalize(5)
  },
  container4: {
     position: 'absolute',

     bottom:0,
    left:0,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
    marginStart:normalize(10),
    marginBottom:normalize(9),
    borderRadius: normalize(30),
    paddingHorizontal: normalize(8),
    paddingVertical: normalize(7),
   
    backgroundColor: 'rgba(255, 255, 255, 0.2)', // for extra contrast
  },
  colorCircle: {
    width: normalize(13),
    height: normalize(13),
    borderRadius: normalize(11),
    marginRight: normalize(4),
  },
  text: {
    color: Colors.white,
    fontSize: normalize(8),
    fontFamily: Fonts.Figtree_SemiBold,
  },
});
export default styles;