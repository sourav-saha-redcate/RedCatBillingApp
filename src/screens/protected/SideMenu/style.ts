import { Colors, Fonts } from "@app/themes";
import { normalize } from "@app/utils/orientation";
import { Platform, StyleSheet } from "react-native";

const styles = StyleSheet.create({
 container: {
    flex: 1,
  },
  background: {
    height: '100%',
    width: '100%',
  },
  mainView: {
    marginHorizontal: normalize(12),
  },
  scrollView: {
    paddingBottom: Platform.OS == 'android' ? normalize(80) : normalize(60),
  },
  flexView: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  spaceView: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  padding: {
    paddingHorizontal: normalize(15),
  },
  horiBar: {
    height: normalize(0.5),
    width: '100%',
    backgroundColor: Colors.border_color,
    marginVertical: normalize(13),
  },
  profileView: {
    width: '94%',
    backgroundColor: Colors.white,
    //shadowColor: Colors.e8_color,
    shadowOpacity: 0.6,
    elevation: 6,
    shadowRadius: normalize(10),
    marginTop: normalize(30),
    borderRadius: normalize(20),
    shadowOffset: { height: 2, width: 0 },
    alignSelf: 'center',
    paddingHorizontal: normalize(15),
    paddingVertical: normalize(20),
    paddingBottom: normalize(30),
    marginBottom: normalize(10),
  },
  editView: {
    backgroundColor: 'rgba(213, 223, 227, 0.3)',
    borderRadius: normalize(15),
    flexDirection: 'row',
    columnGap: normalize(5),
    alignSelf: 'flex-end',
    height: normalize(28),
    alignItems: 'center',
    justifyContent: 'center',
    paddingRight: normalize(15),
    paddingLeft: normalize(5),
  },
  editIcon: {
    height: normalize(20),
    width: normalize(20),
  },
  editText: {
    fontFamily: Fonts.Figtree_Regular,
    color: Colors.light_black,
    fontSize: normalize(12),
  },
  userIcon: {
    height: normalize(80),
    width: normalize(80),
    alignSelf: 'center',
    marginTop: normalize(-15),
    borderRadius:normalize(50)
  },
  name: {
    fontFamily: Fonts.Figtree_Bold,
    color: Colors.light_black,
    fontSize: normalize(16),
    alignSelf: 'center',
    marginTop: normalize(10),
  },
  emailView: {
    columnGap: normalize(5),
    marginTop: normalize(5),
    alignSelf: 'center',
  },
  smsIcon: {
    height: normalize(12),
    width: normalize(12),
  },
  email: {
    fontFamily: Fonts.Figtree_Regular,
    color: Colors.light_black,
    fontSize: normalize(12),
  },
  linearView: {
    height: normalize(40),
    width: normalize(200),
    borderRadius: normalize(10),
  },
  gradient: {
    height: normalize(60),
    width: normalize(130),
    marginTop: normalize(25),
    alignItems: 'center',
    flexDirection: 'row',
    columnGap: normalize(5),
    paddingHorizontal: normalize(15),
  },
  plusUser: {
    height: normalize(35),
    width: normalize(35),
  },
  userCount: {
    fontFamily: Fonts.Figtree_Regular,
    color: '#60666E',
    fontSize: normalize(12),
  },
  number: {
    fontFamily: Fonts.Figtree_Medium,
    //color: Colors.dark_grey,
    fontSize: normalize(11),
    marginTop: normalize(2),
  },
  description: {
    //fontFamily: Fonts.InterTight_Regular,
    color: Colors.text_color,
    fontSize: normalize(11),
    marginTop: normalize(15),
    lineHeight: normalize(17),
  },
  view: {
    marginTop: normalize(15),
    columnGap: normalize(5),
  },
  user: {
    height: normalize(22),
    width: normalize(22),
    borderRadius: normalize(10),
    borderColor: Colors.white,
    borderWidth: normalize(1),
  },
  friend: {
    fontFamily: Fonts.Figtree_Regular,
    color: Colors.light_black,
    fontSize: normalize(10),
  },
  message: {
    height: normalize(22),
    width: normalize(22),
  },
  // renderContainer: {
  //   height: normalize(50),
  //   width: '100%',
  //   marginTop: normalize(5),
  //   flexDirection: 'row',
  //   justifyContent: 'space-between',
  //   alignItems:'center',
  //   paddingHorizontal:normalize(12)
  // },
   renderContainer: {
    height: normalize(45),
    flex:1,
    marginTop: normalize(5),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: normalize(15),
  },
  imahe:{
     height: normalize(30),
    width: normalize(30),
  },
  title:{
    fontFamily: Fonts.Figtree_Medium,
    color: Colors.light_black,
    fontSize: normalize(13), 
    marginLeft:normalize(15)
  },
   arrow: {
    height: normalize(15),
    width: normalize(15),
    transform:[{rotate:'270deg'}]
  },
     modalheading: {
    fontFamily: Fonts.Figtree_SemiBold,
    color: Colors.light_black,
    fontSize: normalize(20),
    alignSelf: 'center',
    marginTop:normalize(10),
    width:'100%',
    textAlign:'center'
  },
    modalheading1: {
    fontFamily: Fonts.Figtree_SemiBold,
    color: Colors.light_black,
    fontSize: normalize(20),
    alignSelf: 'center',
    marginTop:normalize(1),
    width:'100%',
    textAlign:'center'
  },
  description1: {
    // fontFamily: Fonts.InterTight_Regular,
    color: '#474A4F',
    fontSize: normalize(10),
    marginTop: normalize(3),
    textAlign: 'center',
  },
  filterIcon:{
    height:normalize(55),
    width:normalize(55),
    alignSelf: 'center',
  },
  bottomModalView:{
    marginTop:normalize(20),
    flexDirection:'row',
    alignItems:'center',
    columnGap:normalize(10),
    alignSelf: 'center',
  },
  Cancel:{
  fontFamily: Fonts.Figtree_SemiBold,
    color:Colors.light_black,
    fontSize: normalize(14),
    textAlign: 'center',
    marginTop:normalize(15)
}

});
export default styles;