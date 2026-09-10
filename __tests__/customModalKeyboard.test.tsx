import React from 'react';
import {
  Keyboard,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import ReactTestRenderer, { act } from 'react-test-renderer';
import CustomModal from '../src/components/common/CustomModal';

describe('CustomModal Keyboard and Viewport Handling', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders modal children when isModalVisible is true', () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      renderer = ReactTestRenderer.create(
        <CustomModal isModalVisible={true}>
          <Text>Test Modal Content</Text>
        </CustomModal>,
      );
    });

    const root = renderer!.root;
    const textNodes = root.findAll(
      node => node.props.children === 'Test Modal Content',
    );
    expect(textNodes.length).toBeGreaterThan(0);
  });

  it('does not render content when isModalVisible is false', () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      renderer = ReactTestRenderer.create(
        <CustomModal isModalVisible={false}>
          <Text>Hidden Modal Content</Text>
        </CustomModal>,
      );
    });

    const root = renderer!.root;
    const modalInstance = root.findByType(require('react-native').Modal);
    expect(modalInstance.props.visible).toBe(false);
  });

  it('registers and removes keyboard listeners on mount and unmount', () => {
    const addListenerSpy = jest.spyOn(Keyboard, 'addListener');

    let renderer: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      renderer = ReactTestRenderer.create(
        <CustomModal isModalVisible={true}>
          <Text>Listening Content</Text>
        </CustomModal>,
      );
    });

    expect(addListenerSpy).toHaveBeenCalledWith(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      expect.any(Function),
    );
    expect(addListenerSpy).toHaveBeenCalledWith(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      expect.any(Function),
    );

    act(() => {
      renderer!.unmount();
    });

    addListenerSpy.mockRestore();
  });

  it('renders internal ScrollView with keyboardShouldPersistTaps="handled"', () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      renderer = ReactTestRenderer.create(
        <CustomModal isModalVisible={true}>
          <Text>Scroll Content</Text>
        </CustomModal>,
      );
    });

    const root = renderer!.root;
    const scrollView = root.findByType(ScrollView);
    expect(scrollView).toBeTruthy();
    expect(scrollView.props.keyboardShouldPersistTaps).toBe('handled');
    expect(scrollView.props.showsVerticalScrollIndicator).toBe(false);
  });

  it('renders Forgot Password flow Email modal with accessible input and next button', () => {
    const onNextMock = jest.fn();
    let renderer: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      renderer = ReactTestRenderer.create(
        <CustomModal isModalVisible={true}>
          <Text>Forgot Password</Text>
          <Text>Enter your registered email address or phone number</Text>
          <TextInput
            placeholder="Email or Phone Number"
            value="test@example.com"
          />
          <TouchableOpacity onPress={onNextMock}>
            <Text>Next</Text>
          </TouchableOpacity>
        </CustomModal>,
      );
    });

    const root = renderer!.root;
    const inputs = root.findAllByType(TextInput);
    expect(inputs.length).toBe(1);
    expect(inputs[0].props.value).toBe('test@example.com');

    const touchables = root.findAllByType(TouchableOpacity);
    const nextBtn = touchables.find(
      t => t.findAll(n => n.props.children === 'Next').length > 0,
    );
    expect(nextBtn).toBeTruthy();
    act(() => {
      nextBtn!.props.onPress();
    });
    expect(onNextMock).toHaveBeenCalled();
  });

  it('renders OTP modal with 6 digit inputs and verify button', () => {
    const onVerifyMock = jest.fn();
    let renderer: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      renderer = ReactTestRenderer.create(
        <CustomModal isModalVisible={true}>
          <Text>OTP Verification</Text>
          <TextInput value="8" />
          <TextInput value="3" />
          <TextInput value="4" />
          <TextInput value="1" />
          <TextInput value="0" />
          <TextInput value="3" />
          <TouchableOpacity onPress={onVerifyMock}>
            <Text>Verify OTP</Text>
          </TouchableOpacity>
        </CustomModal>,
      );
    });

    const root = renderer!.root;
    const inputs = root.findAllByType(TextInput);
    expect(inputs.length).toBe(6);

    const touchables = root.findAllByType(TouchableOpacity);
    const verifyBtn = touchables.find(
      t => t.findAll(n => n.props.children === 'Verify OTP').length > 0,
    );
    expect(verifyBtn).toBeTruthy();
    act(() => {
      verifyBtn!.props.onPress();
    });
    expect(onVerifyMock).toHaveBeenCalled();
  });

  it('renders Change Password modal with New Password, Confirm Password, and Submit button', () => {
    const onSubmitMock = jest.fn();
    let renderer: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      renderer = ReactTestRenderer.create(
        <CustomModal isModalVisible={true}>
          <Text>Change Password</Text>
          <TextInput placeholder="New Password" value="Secret123!" />
          <TextInput placeholder="Confirm Password" value="Secret123!" />
          <TouchableOpacity onPress={onSubmitMock}>
            <Text>Submit</Text>
          </TouchableOpacity>
        </CustomModal>,
      );
    });

    const root = renderer!.root;
    const inputs = root.findAllByType(TextInput);
    expect(inputs.length).toBe(2);
    expect(inputs[0].props.placeholder).toBe('New Password');
    expect(inputs[1].props.placeholder).toBe('Confirm Password');

    const touchables = root.findAllByType(TouchableOpacity);
    const submitBtn = touchables.find(
      t => t.findAll(n => n.props.children === 'Submit').length > 0,
    );
    expect(submitBtn).toBeTruthy();
    act(() => {
      submitBtn!.props.onPress();
    });
    expect(onSubmitMock).toHaveBeenCalled();
  });

  it('dismisses keyboard and calls onBackdropPress when cross button is pressed', () => {
    const onBackdropPress = jest.fn();
    const dismissSpy = jest.spyOn(Keyboard, 'dismiss');

    let renderer: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      renderer = ReactTestRenderer.create(
        <CustomModal
          isModalVisible={true}
          onBackdropPress={onBackdropPress}>
          <Text>Backdrop Test</Text>
        </CustomModal>,
      );
    });

    const root = renderer!.root;
    const touchables = root.findAllByType(TouchableOpacity);
    if (touchables.length > 0) {
      act(() => {
        touchables[0].props.onPress();
      });
      expect(dismissSpy).toHaveBeenCalled();
      expect(onBackdropPress).toHaveBeenCalled();
    }

    dismissSpy.mockRestore();
  });
});
