import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Toast from 'react-native-toast-message';
import { LessonItem } from '../LessonItem';
import { LessonModal } from '../LessonModal';
import { Lesson } from '../../types';

const LESSONS_DATA: Lesson[] = [
  { id: 1, title: 'Welcome Journey', status: 'done' },
  { id: 2, title: 'Переключение на себя', status: 'active' },
  { id: 3, title: 'Источник вдохновения', status: 'locked' },
  { id: 4, title: 'Пространство идей', status: 'locked' },
  { id: 5, title: 'Финальный тест', status: 'locked' },
];

export const GrowthMap: React.FC = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);

  const handleLessonPress = (lesson: Lesson) => {
    switch (lesson.status) {
      case 'active':
        console.log('Start lesson');
        setSelectedLesson(lesson);
        setModalVisible(true);
        break;
      case 'locked':
        Toast.show({
          type: 'info',
          text1: '🔒 Урок заблокирован',
          text2: `Урок "${lesson.title}" пока недоступен. Сначала необходимо завершить предыдущие уроки.`,
          position: 'top',
          topOffset: 60,
          visibilityTime: 3000,
        });
        break;
      case 'done':
        Toast.show({
          type: 'success',
          text1: '✅ Урок завершен',
          text2: `Урок "${lesson.title}" уже успешно завершен.`,
          position: 'top',
          topOffset: 60,
          visibilityTime: 2000,
        });
        break;
    }
  };

  const renderLessonItem = ({ item }: { item: Lesson }) => (
    <LessonItem lesson={item} onPress={handleLessonPress} />
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.title}>Карта развития</Text>
      <Text style={styles.subtitle}>
        Пройдите все уроки последовательно для достижения цели
      </Text>
    </View>
  );

  return (
    <>
      <LinearGradient
        colors={['#f8fafc', '#e0e7ff', '#f0f9ff']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.container}
      >
        <SafeAreaView style={styles.safeArea}>
          <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
          <FlatList
            data={LESSONS_DATA}
            renderItem={renderLessonItem}
            keyExtractor={(item) => item.id.toString()}
            ListHeaderComponent={renderHeader}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContainer}
          />
        </SafeAreaView>
      </LinearGradient>
      <LessonModal
        visible={modalVisible}
        lesson={selectedLesson}
        onClose={() => setModalVisible(false)}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  listContainer: {
    paddingBottom: 30,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    lineHeight: 24,
  },
});
