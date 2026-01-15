import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { LessonItemProps } from '../../types';

export const LessonItem: React.FC<LessonItemProps> = ({ lesson, onPress }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();

    if (lesson.status === 'active') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [lesson.status]);

  const handlePress = () => {
    if (lesson.status === 'locked') {
      shakeAnim.setValue(0);
      Animated.sequence([
        Animated.timing(shakeAnim, {
          toValue: 10,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnim, {
          toValue: -10,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnim, {
          toValue: 10,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnim, {
          toValue: -10,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnim, {
          toValue: 0,
          duration: 50,
          useNativeDriver: true,
        }),
      ]).start();
    }
    onPress(lesson);
  };

  const getStatusIcon = () => {
    switch (lesson.status) {
      case 'done':
        return '✓';
      case 'active':
        return '▶';
      case 'locked':
        return '🔒';
      default:
        return '';
    }
  };

  const isLocked = lesson.status === 'locked';

  const renderContent = () => {
    if (lesson.status === 'done') {
      return (
        <LinearGradient
          colors={['#10b981', '#059669']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradientContainer}
        >
          <View style={styles.content}>
            <View style={[styles.iconContainer, styles.doneIconContainer]}>
              <Text style={styles.doneIcon}>{getStatusIcon()}</Text>
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.doneTitle}>{lesson.title}</Text>
              <Text style={styles.doneSubtitle}>Завершено</Text>
            </View>
          </View>
        </LinearGradient>
      );
    }

    if (lesson.status === 'active') {
      return (
        <Animated.View
          style={{
            transform: [{ scale: pulseAnim }],
          }}
        >
          <LinearGradient
            colors={['#3b82f6', '#2563eb', '#1d4ed8']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradientContainer}
          >
            <View style={styles.content}>
              <View style={[styles.iconContainer, styles.activeIconContainer]}>
                <Text style={styles.activeIcon}>{getStatusIcon()}</Text>
              </View>
              <View style={styles.textContainer}>
                <Text style={styles.activeTitle}>{lesson.title}</Text>
                <Text style={styles.activeSubtitle}>Нажмите для начала</Text>
              </View>
              <View style={styles.playButton}>
                <Text style={styles.playIcon}>▶</Text>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>
      );
    }

    return (
      <View style={styles.lockedContainer}>
        <View style={styles.content}>
          <View style={[styles.iconContainer, styles.lockedIconContainer]}>
            <Text style={styles.lockedIcon}>{getStatusIcon()}</Text>
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.lockedTitle}>{lesson.title}</Text>
            <Text style={styles.lockedSubtitle}>Заблокировано</Text>
          </View>
        </View>
      </View>
    );
  };

  const getAnimatedStyle = () => {
    const baseStyle = {
      opacity: fadeAnim,
      transform: [{ scale: scaleAnim }],
    };

    if (isLocked) {
      return {
        ...baseStyle,
        transform: [
          { scale: scaleAnim },
          { translateX: shakeAnim },
        ],
      };
    }

    return baseStyle;
  };

  return (
    <Animated.View
      style={[
        styles.wrapper,
        getAnimatedStyle(),
      ]}
    >
      <TouchableOpacity
        onPress={handlePress}
        activeOpacity={isLocked ? 1 : 0.8}
      >
        {renderContent()}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginHorizontal: 20,
    marginVertical: 10,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  gradientContainer: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  lockedContainer: {
    backgroundColor: '#f1f5f9',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  doneIconContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  activeIconContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  lockedIconContainer: {
    backgroundColor: '#cbd5e1',
  },
  doneIcon: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  activeIcon: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  lockedIcon: {
    fontSize: 24,
    color: '#64748b',
  },
  textContainer: {
    flex: 1,
  },
  doneTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  activeTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  lockedTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 4,
  },
  doneSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  activeSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  lockedSubtitle: {
    fontSize: 14,
    color: '#94a3b8',
  },
  playButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  playIcon: {
    fontSize: 18,
    color: '#ffffff',
    marginLeft: 2,
  },
});
