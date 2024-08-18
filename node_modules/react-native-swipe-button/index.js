import React, { Component } from 'react';
import {
  Dimensions,
  InteractionManager,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

type Props = {
  title?: string;
  containerStyle?: any;
  style?: any;
  textStyle?: any;
  allowFontScaling?: bool;
  onSwipe: () => mixed;
};

const runAfterInteractions = func => {
  setTimeout(() => InteractionManager.runAfterInteractions(() => func()), 1);
}

export default class SwipeButton extends Component {
  constructor(props) {
    super(props);

    const { style } = this.props;
    const marginLeft = style.marginHorizontal || style.marginLeft || 0;
    const marginRight = style.marginHorizontal || style.marginRight || 0;
    const buttonWidth = (style.width || Dimensions.get('window').width) - marginLeft - marginRight;

    this.state = { buttonWidth }
  }

  componentDidMount() {
    if (Platform.OS === 'ios') {
      this.resetSwipePosition();
    } else if (Platform.OS === 'android') {
      runAfterInteractions(() => this.resetSwipePosition());
    }
  }

  resetSwipePosition() {
    if (this.scrollView) {
      this.scrollView.scrollTo({ x: this.state.buttonWidth, animated: false });
    }
  }

  onSwipeButton(offset) {
    const { onSwipe } = this.props;
    const { buttonWidth } = this.state;
    const position = offset.nativeEvent.contentOffset.x;

    if (position === 0 || position === (this.state.buttonWidth * 2)) {
      if (Platform.OS === 'ios') {
        this.resetSwipePosition();
      } else if (Platform.OS === 'android') {
        runAfterInteractions(() => {
          this.resetSwipePosition();
          setTimeout(() => this.resetSwipePosition(), 500); // Strangely, this is necessary on Android
        });
      }

      if (this.scrollView) {
        onSwipe();
      }
    }
  }

  props: Props

  render() {
    const { title, containerStyle, style, textStyle, allowFontScaling } = this.props;

    return (
      <View style={[styles.container, containerStyle]}>
        <ScrollView
          ref={input => { this.scrollView = input; }}
          style={[styles.buttonStyle, style]}
          contentContainerStyle={[styles.scrollView, { width: this.state.buttonWidth * 3 }]}
          horizontal
          scrollEnabled
          pagingEnabled
          bounces={false}
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={offset => this.onSwipeButton(offset)}>
          <Text
            style={[styles.buttonTitle, textStyle]}
            allowFontScaling={allowFontScaling}>
            {title}
          </Text>
        </ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    height: 50,
    borderTopWidth: 0.5,
  },
  buttonTitle: {
    color: 'white',
    fontSize: 22,
    fontWeight: '500',
  },
});
