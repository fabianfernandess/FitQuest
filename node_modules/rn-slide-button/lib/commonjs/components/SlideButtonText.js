"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = _interopRequireDefault(require("react"));

var _reactNative = require("react-native");

var _reactNativeReanimated = _interopRequireWildcard(require("react-native-reanimated"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const DEFAULT_TEXT_COLOR = '#FAFAFA';

const SlideButtonText = ({
  title,
  titleStyle,
  titleContainerStyle,
  height,
  borderRadius,
  padding,
  translateX,
  scrollDistance
}) => {
  const textAnimStyle = (0, _reactNativeReanimated.useAnimatedStyle)(() => {
    return {
      opacity: (0, _reactNativeReanimated.interpolate)(translateX.value, [0, scrollDistance], [0.99, 0], _reactNativeReanimated.Extrapolate.CLAMP)
    };
  });
  return /*#__PURE__*/_react.default.createElement(_reactNative.View, {
    testID: "TitleContainer",
    style: [styles.titleContainer, {
      height,
      margin: padding,
      borderRadius
    }, titleContainerStyle]
  }, /*#__PURE__*/_react.default.createElement(_reactNativeReanimated.default.Text, {
    testID: "Title",
    numberOfLines: 2,
    allowFontScaling: false,
    style: [styles.title, titleStyle, textAnimStyle]
  }, title));
};

var _default = /*#__PURE__*/_react.default.memo(SlideButtonText);

exports.default = _default;

const styles = _reactNative.StyleSheet.create({
  titleContainer: {
    justifyContent: 'center',
    alignItems: 'center'
  },
  title: {
    fontSize: 16,
    maxWidth: '50%',
    textAlign: 'center',
    color: DEFAULT_TEXT_COLOR
  }
});
//# sourceMappingURL=SlideButtonText.js.map