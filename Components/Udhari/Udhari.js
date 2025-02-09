import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
  interpolateColor,
} from 'react-native-reanimated';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.3;

const statuses = ['Pending', 'Ongoing', 'Completed', 'Delivered'];
const statusColors = {
  Pending: '#FFA500',
  Ongoing: '#1E90FF',
  Completed: '#32CD32',
  Delivered: '#FFD700',
};

const Udhari = () => {
  const [currentStatusIndex, setCurrentStatusIndex] = useState(0);
  const translateX = useSharedValue(0);

  const updateStatus = (direction) => {
    setCurrentStatusIndex((prevIndex) => {
      const newIndex = Math.min(
        Math.max(prevIndex + direction, 0),
        statuses.length - 1
      );
      return newIndex;
    });
  };

  const swipeGesture = Gesture.Pan()
    .onUpdate((event) => {
      translateX.value = event.translationX;
    })
    .onEnd(() => {
      if (translateX.value < -SWIPE_THRESHOLD && currentStatusIndex > 0) {
        runOnJS(updateStatus)(-1); // Move to previous status on left swipe
      } else if (translateX.value > SWIPE_THRESHOLD && currentStatusIndex < statuses.length - 1) {
        runOnJS(updateStatus)(1); // Move to next status on right swipe
      }
      translateX.value = withSpring(0);
    });

  const animatedStyle = useAnimatedStyle(() => {
    // const nextIndex = translateX.value < 0 
    //   ? Math.min(currentStatusIndex + 1, statuses.length - 1)
    //   : Math.max(currentStatusIndex - 1, 0);
    return {
      transform: [{ translateX: translateX.value }],
    };
  });

  const animatedStyle2 = useAnimatedStyle(() => {
    const nextIndex = translateX.value < 0 
      ? Math.min(currentStatusIndex + 1, statuses.length - 1)
      : Math.max(currentStatusIndex - 1, 0);

    const backgroundColor = interpolateColor(
      translateX.value,
      [-SWIPE_THRESHOLD, 0, SWIPE_THRESHOLD],
      [
        statusColors[statuses[nextIndex]], // Left swipe (next status)
        statusColors[statuses[currentStatusIndex]], // Current status
        statusColors[statuses[nextIndex]], // Right swipe (previous status)
      ]
    );
    return {
      backgroundColor, // Apply the interpolated background color only to the container
    };
  });

  return (
    <GestureHandlerRootView style={styles.container}>
      {/* Apply the animated style to the swipeable container */}
      <Animated.View style={[styles.swipeableContainer, animatedStyle2]}>
        <GestureDetector gesture={swipeGesture}>
          <Animated.View style={[styles.item, animatedStyle]}>
            <Text style={styles.currentStatus}>{statuses[currentStatusIndex]}</Text>
          </Animated.View>
        </GestureDetector>
      </Animated.View>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  swipeableContainer: {
    width: SCREEN_WIDTH * 0.9,
    height: 50,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    overflow: 'hidden',
  },
  item: {
    width: '25%',
    height: '90%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    backgroundColor: 'white', // Make the draggable area white
  },
  currentStatus: {
    color: 'black',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default Udhari;
