import React, { useEffect, useRef, useState } from 'react';
import {
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
  TouchableOpacity,
  Image,
  ImageBackground,
  TextInput,
} from 'react-native';
import { normalize } from '@app/utils/orientation';
import TextInputComponent from '@app/components/common/TextInput';
import Button from '@app/components/common/Button';
import { Colors, Fonts, Icons, Images } from '@app/themes';
import CustomModal from '@app/components/common/CustomModal';
import { useAppDispatch, useAppSelector } from '@app/store';
import // AccOtpVerifyRequest,
// accountResendRequest,
// RoleListRequest,
// ServiceTypeListRequest,
// signUpRequest,
// SportListRequest,
'@app/store/slice/auth.slice';
import CustomDropdown from '@app/components/common/CustomDropDown';
import { useIsFocused } from '@react-navigation/native';
//import { role, ROLE_TYPE, ServiceType, Sport } from '@app/types';
import { showMessage } from '@app/utils/helpers/Toast';
import {
  validateEmail,
  validatePassword,
  validMinLength,
  validPhoneNumber,
} from '@app/utils/helpers/Validation';

let status = '';

interface SignInProps {
  email: string;
  password: string;
  fname: string;
  phnNo: string;
  pincode: string;
  conPass: string;
}

const SignUp: React.FC<{ navigation: any }> = ({ navigation }) => {
  // const dispatch = useAppDispatch();
  // const [forgot, setForgot] = useState<string>('');

  //   const [otpmodalVisible, setOtpModalVisible] = useState<boolean>(false);
  //   const [forgotEmail, setForgotEmail] = useState<string>('');
  // const [accountVerification, setAccountVerification] =useState<boolean>(false);

  // const isFocus = useIsFocused();
  //const [flag, setFlag] = useState(0);
  //const Colors = useColors();
  //const AuthReducer = useAppSelector(state => state.auth);
  // const { roleRes, ServiceTypeListRes, SportListRes } = useAppSelector(state => state.auth,);
  // const [activeId, setActiveId] = useState<string>(
  //   roleRes?.data?.[0]?._id ?? '',
  // );
  // const [active, setActive] = useState<string>(
  //   roleRes?.data?.[0]?.role ?? 'player',
  // );
  // const [serviceType, setServiceType] = useState<ServiceType[]>(
  //   ServiceTypeListRes?.data?.docs ?? [],
  // );
  // const [sportlist, setSportlist] = useState<Sport[]>(
  //   SportListRes?.data?.docs ?? [],
  // );

  const [info, setInfo] = useState<SignInProps>({
    fname: '',
    phnNo: '',
    pincode: '',
    email: '',
    password: '',
    conPass: '',
  });
  const [remember, setRemember] = useState<boolean>(false);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '']);
  // const [role, setRole] = useState<Array<role>>([]);
  const inputRefs = Array.from({ length: 4 }, () => useRef<TextInput>(null));
  const [selectedCode, setSelectedCode] = useState<string>('');

  const updateValue = (field: keyof SignInProps, value: boolean | string) => {
    setInfo(prevState => ({
      ...prevState,
      [field]: value,
    }));
  };

  // const handleOtpInputChange = (text: string, index: number) => {
  //   if (text.length > 1) {
  //     text = text[0];
  //   }

  //   const newOtpDigits = [...otpDigits];
  //   newOtpDigits[index] = text;
  //   setOtpDigits(newOtpDigits);
  //   if (text !== '' && index < 4 - 1) {
  //     inputRefs[index + 1]?.current?.focus();
  //   } else if (text === '' && index > 0) {
  //     inputRefs[index - 1]?.current?.focus();
  //   }
  // };

  // const renderOtpInputs = () => {
  //   return otpDigits.map((digit, index) => (
  //     <TextInput
  //       key={index}
  //       style={[
  //         styles.input,
  //         {
  //           color: Colors.text_grey,
  //           backgroundColor: Colors.input_back,
  //           borderColor: Colors.input_border,
  //           shadowColor: Colors.input_shadow,
  //         },
  //       ]}
  //       value={digit}
  //       onChangeText={text => handleOtpInputChange(text, index)}
  //       keyboardType="phone-pad"
  //       maxLength={1}
  //       ref={inputRefs[index]}
  //       placeholder="_"
  //       placeholderTextColor={Colors.placeholder_text}
  //     />
  //   ));
  // };

  // useEffect(() => {
  //   if (isFocus) {
  //     dispatch(RoleListRequest());
  //     dispatch(
  //       ServiceTypeListRequest({
  //         limit: 50,
  //         page: 1,
  //       }),
  //     );
  //     dispatch(
  //       SportListRequest({
  //         limit: 50,
  //         page: 1,
  //       }),
  //     );
  //   }
  // }, [isFocus]);

  // if (status === '' || AuthReducer.status !== status) {
  //   switch (AuthReducer.status) {

  //     case 'auth/signUpRequest':
  //       status = AuthReducer.status;
  //       break;
  //     case 'auth/signUpSuccess':
  //       status = AuthReducer.status;
  //       setModalVisible(true);
  //       break;
  //     case 'auth/signUpFailure':
  //       status = AuthReducer.status;

  //       break;
  //     case 'auth/AccOtpVerifyRequest':
  //       status = AuthReducer.status;
  //       break;
  //     case 'auth/AccOtpVerifySuccess':
  //       status = AuthReducer.status;
  //       setModalVisible(false);
  //       break;
  //     case 'auth/AccOtpVerifyFailure':
  //       status = AuthReducer.status;

  //       break;
  //   }
  // }

  // const signUpPlayer = () => {
  //   if (!info?.comName ) {
  //     showMessage('Please enter your business name');
  //   } else if (!info?.fname) {
  //     showMessage('Please enter your full name');
  //   } else if (!info?.email) {
  //     showMessage('Please enter your email');
  //   } else if (!validateEmail(info?.email)) {
  //     showMessage('Please enter the valid email address');
  //   } else if (!info?.countryCode) {
  //     showMessage('Please select your country code');
  //   } else if (!info?.phnNo) {
  //     showMessage('Please enter your phone number');
  //   } else if (!validPhoneNumber(info?.phnNo)) {
  //     showMessage('Please enter the valid phone number');
  //   } else if (!info?.location) {
  //     showMessage('Please enter your location');
  //   } else if (!info?.categoreyId ) {
  //     showMessage('Please select service category');
  //   } else if (info?.sports?.length === 0) {
  //     showMessage('Please select sport');
  //   } else if (!info?.password) {
  //     showMessage('Please enter your password');
  //   } else if (!validMinLength.test(info?.password)) {
  //     showMessage('Password must be at least 8 characters long.');
  //   } else if (!validatePassword(info?.password)) {
  //     showMessage(
  //       `Password should contain uppercase, lowercase, number, and symbol between #?!@$%^&*-''`,
  //     );
  //   } else if (!info?.conPass) {
  //     showMessage('Please enter your confirm password');
  //   } else if (info?.password !== info.conPass) {
  //     showMessage('confirm password should be same as password');
  //   } else if (!remember) {
  //     showMessage('Please accept terms & conditions and privacy policy');
  //   } else {
  //     {
  //       // active === 'provider'
  //       //   ? dispatch(
  //       //       signUpRequest({
  //       //         email: info?.email?.toLowerCase(),
  //       //         fullName: info?.fname,
  //       //         password: info?.password,
  //       //         phoneNumber: info?.phnNo,
  //       //         role: activeId,
  //       //         businessName: info?.comName,
  //       //         sports: info?.sports,
  //       //         serviceType: info?.categoreyId,
  //       //         countryCode: info?.countryCode,
  //       //         preferredLocation: {
  //       //           type: 'Point',
  //       //           coordinates: [88.3639, 22.5726],
  //       //           address: '123 Main St',
  //       //           country: 'India',
  //       //           city: 'Bangalore',
  //       //           state: 'Karnataka',
  //       //           zipcode: '560001',
  //       //         },
  //       //       }),
  //       //     )
  //       //   : dispatch(
  //       //       signUpRequest({
  //       //         email: info?.email?.toLowerCase(),
  //       //         fullName: info?.fname,
  //       //         password: info?.password,
  //       //         phoneNumber: info?.phnNo,
  //       //         countryCode: info?.countryCode,
  //       //         role: activeId,
  //       //         preferredLocation: {
  //       //           type: 'Point',
  //       //           coordinates: [88.3639, 22.5726],
  //       //           address: '123 Main St',
  //       //           country: 'India',
  //       //           city: 'Bangalore',
  //       //           state: 'Karnataka',
  //       //           zipcode: '560001',
  //       //         },
  //       //       }),
  //       //     );
  //     }
  //   }
  // };

  // //Reset otp field
  // const resetOtpDigits = () => {
  //   setOtpDigits(Array(4).fill(''));
  // };
  // const accountResendOtp = () => {
  //   //dispatch(accountResendRequest(AuthReducer?.signupRes?.data?.accessToken ?? ''), );
  // };

  // const otpVerify = () => {
  //   if (otpDigits?.every(item => item === '')) {
  //     showMessage('Enter the otp');
  //   } else if (otpDigits?.some(item => item === '')) {
  //     showMessage('Valid otp is required.');
  //   } else {
  //     // dispatch(
  //     //   AccOtpVerifyRequest({
  //     //     otp: otpDigits?.join(''),
  //     //     token: AuthReducer?.signupRes?.data?.accessToken ?? '',
  //     //   }),
  //     // );
  //   }
  // };
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS == 'ios' ? 'padding' : undefined}
    >
      <View style={styles.background}>
        <Image
          source={Images.logo}
          resizeMode="contain"
          style={styles.logoIcon}
        />
        <View style={[styles.container]}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            bounces={false}
            contentContainerStyle={styles.mainView}
          >
            <Text style={[styles.heading]}>Sign Up</Text>
            <Text style={[styles.description]}>
              Please fill in this form to create your account
            </Text>

            <View style={styles.marTop}>
              <TextInputComponent
                placeholder="Full Name"
                value={info?.fname}
                onChangeText={value => updateValue('fname', value)}
                marginVertical={normalize(3)}
                // keyboardType=""
              />

              <TextInputComponent
                placeholder="Email Address"
                value={info?.email}
                onChangeText={value => updateValue('email', value)}
                marginVertical={normalize(3)}
                keyboardType="email-address"
              />
              <TextInputComponent
                placeholder="Phone Number"
                value={info?.phnNo}
                onChangeText={value => updateValue('phnNo', value)}
                marginVertical={normalize(3)}
                keyboardType="phone-pad"
              />
              <TextInputComponent
                placeholder="Pincode"
                value={info?.pincode}
                onChangeText={value => updateValue('pincode', value)}
                marginVertical={normalize(3)}
                keyboardType="phone-pad"
              />
              <TextInputComponent
                placeholder="Password"
                value={info?.password}
                onChangeText={value => updateValue('password', value)}
                marginVertical={normalize(3)}
                secureTextEntry={true}
              />
 <TextInputComponent
                placeholder="Confirm Password"
                value={info?.conPass}
                onChangeText={value => updateValue('conPass', value)}
                marginVertical={normalize(3)}
                secureTextEntry={true}
              />
              {/* Remember Me */}
              <View style={[styles.flexView, { marginTop: normalize(15) }]}>
                <View style={[styles.flexView]}>
                  <TouchableOpacity
                    onPress={() => {
                      //setRemember(!remember);
                    }}
                    style={[styles.checkbox]}
                  >
                    {/* {remember ? (
                      <Image
                        source={Icons.check_mark}
                        style={[
                          styles.greenBox,
                          { tintColor: Colors.brown_color },
                        ]}
                        resizeMode="contain"
                      />
                    ) : null} */}
                  </TouchableOpacity>
                  <Text style={[styles.termsText]}>{'Accept terms & conditions and privacy policy of\nAduri Pants'}</Text>
                </View>
                {/* <TouchableOpacity
                  onPress={() => {
                    //setModalVisible(true);
                  }}
                >
                  <Text style={[styles.forgot]}>Forgot Password?</Text>
                </TouchableOpacity> */}
              </View>
              <View style={{ alignItems: 'center' }}>
                <Button
                  width={'100%'}
                  marginTop={normalize(20)}
                  title="Sign Up"
                  onPress={() => {}}
                />
              </View>
              <View style={[styles.centerView, styles.marTop]}>
                <Text style={[styles.dont]}>Already have an account?</Text>
                <TouchableOpacity
                  onPress={() => {
                    navigation.navigate('SignIn');
                  }}
                >
                  <Text style={[styles.signUp]}>Sign In</Text>
                </TouchableOpacity>
              </View>
              {/* <TouchableOpacity>
                <Text style={styles.continue}>Continue As Guest</Text>
              </TouchableOpacity> */}
            </View>
          </ScrollView>
        </View>
        {/** Forgot password */}
        {/* <CustomModal
          isModalVisible={modalVisible}
          onBackdropPress={() => {
            setModalVisible(false);
          }}
        >
          <Text style={[styles.heading]}>
            Forgot <Text style={[styles.heading]}>Password</Text>
          </Text>
          <Text style={[styles.description]}>
            Vulputate neque dui et blandit
          </Text>
          <View style={styles.marHori}>
            <TextInputComponent
              placeholder="email address"
              value={forgot}
              onChangeText={value => {
                setForgot(value);
                setForgotEmail(value);
              }}
              marginVertical={normalize(3)}
              keyboardType="email-address"
            />
            <View style={{ alignItems: 'center' }}>
              <Button
                width={'100%'}
                marginTop={normalize(5)}
                title="next"
                onPress={() => {
                  setModalVisible(false);
                  setTimeout(() => {
                    setOtpModalVisible(true);
                    setForgot('');
                  }, 500);
                }}
              />
            </View>
          </View>
        </CustomModal> */}
        {/** Otp */}
        {/* <CustomModal
          isModalVisible={otpmodalVisible}
          onBackdropPress={() => {
            setOtpModalVisible(false);
          }}
        >
          <Text style={[styles.heading]}>
            OTP <Text style={[styles.heading]}>verification</Text>
          </Text>
          <Text style={[styles.description]}>
            Vulputate neque dui et blandit
          </Text>
          <View style={[styles.otpContainer]}>{renderOtpInputs()}</View>
          <View style={{ alignItems: 'center' }}>
            <Button
              width={'75%'}
              marginTop={normalize(5)}
              title="Continue"
              onPress={() => {
                setOtpModalVisible(false);
                setTimeout(() => {
                  setResetModalVisible(true);
                  resetOtpDigits();
                }, 500);
              }}
            />
          </View>
          <View style={styles.didnotView}>
            <Text style={[styles.dont]}>If you did not receive a code! </Text>
            <TouchableOpacity onPress={() => {}}>
              <Text style={[styles.dont]}>Resend</Text>
            </TouchableOpacity>
          </View>
        </CustomModal> */}

        {/** Change password */}
        {/* <CustomModal
          isModalVisible={resetmodalVisible}
          onBackdropPress={() => {
            setResetModalVisible(false);
          }}
        >
          <Text style={[styles.heading]}>
            Change <Text style={[styles.heading]}>Password</Text>
          </Text>
          <Text style={[styles.description]}>
            Vulputate neque dui et blandit
          </Text>
          <View style={styles.marHori}>
            <TextInputComponent
              placeholder="new Password"
              value={change?.password}
              onChangeText={value => updateChangeValue('password', value)}
              marginVertical={normalize(3)}
              secureTextEntry={true}
            />
            <TextInputComponent
              placeholder="confirm Password"
              value={change?.conPass}
              onChangeText={value => updateChangeValue('conPass', value)}
              marginVertical={normalize(3)}
              secureTextEntry={true}
            />
            <View style={{ alignItems: 'center' }}>
              <Button
                width={'77%'}
                marginTop={normalize(5)}
                title="Continue"
                onPress={() => {
                  setTimeout(() => {
                    setResetModalVisible(false);
                    setChange({ conPass: '', password: '' });
                  }, 500);
                }}
              />
            </View>
          </View>
        </CustomModal> */}
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderTopLeftRadius: normalize(30),
    borderTopRightRadius: normalize(30),
    shadowOpacity: 0.6,
    elevation: 6,
    shadowRadius: normalize(10),
    marginTop: normalize(50),
    backgroundColor: Colors.white,
    shadowColor: 'rgba(242, 204, 204, 0.13)',
  },
  background: {
    height: '100%',
    width: '100%',
    backgroundColor: Colors.light_red,
  },
  mainView: {
    marginHorizontal: normalize(12),
    marginTop: normalize(30),
    paddingBottom: Platform.OS === 'android' ? normalize(80) : normalize(50),
  },
  marHori: {
    marginHorizontal: normalize(12),
  },
  logoIcon: {
    width: normalize(75),
    height: normalize(75),
    alignSelf: 'center',
    marginTop: normalize(80),
  },
  heading: {
    fontFamily: Fonts.DMSans_18pt_SemiBold,
    fontSize: normalize(24),
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    color: Colors.text_color,
  },
  description: {
    fontFamily: Fonts.Figtree_Regular,
    fontSize: normalize(12),
    marginTop: normalize(10),
    alignSelf: 'center',
    width: '100%',
    textAlign: 'center',
    lineHeight: normalize(18),
    color: Colors.light_black,
  },
  flexView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  spaceView: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    columnGap: normalize(5),
  },
  centerView: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    columnGap: normalize(5),
  },
  marTop: {
    marginTop: normalize(15),
  },
  checkbox: {
    height: normalize(17),
    width: normalize(17),
    borderRadius: normalize(2),
    borderWidth: normalize(1),
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: Colors.border_clg,
    backgroundColor: Colors.white,
  },
  greenBox: {
    height: normalize(13),
    width: normalize(13),
    backgroundColor: Colors.button_color,
  },
  termsText: {
    fontFamily: Fonts.Figtree_Regular,
    fontSize: normalize(12),
    marginLeft: normalize(6),
    color: Colors.light_black,
  },
  forgot: {
    fontFamily: Fonts.Figtree_SemiBold,
    fontSize: normalize(12),
    color: Colors.button_color,
  },
  bottomView: {
    alignSelf: 'center',
    marginBottom: Platform.OS === 'android' ? normalize(25) : normalize(0),
  },
  dont: {
    fontFamily: Fonts.Figtree_Regular,
    fontSize: normalize(12),
    color: Colors.light_black,
  },
  signUp: {
    fontFamily: Fonts.Figtree_SemiBold,
    fontSize: normalize(12),
    color: Colors.button_color,
  },
  continue: {
    fontFamily: Fonts.Figtree_SemiBold,
    fontSize: normalize(12),
    color: Colors.button_color,
    alignSelf: 'center',
    marginTop: normalize(30),
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '78%',
    marginTop: normalize(10),
    alignSelf: 'center',
  },
  input: {
    width: normalize(50),
    height: normalize(50),
    borderRadius: normalize(18),
    textAlign: 'center',
    fontSize: normalize(16),
    borderWidth: normalize(1),
    marginVertical: normalize(10),
    marginBottom: normalize(15),
    // fontFamily: Fonts.TrendSansOne,
    elevation: 6,
    shadowOpacity: 0.8,
    shadowOffset: { height: 6, width: 1 },
    shadowRadius: normalize(15),
  },
  didnotView: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    marginVertical: normalize(18),
    marginTop: normalize(22),
  },
});
export default SignUp;
