# Архитектура базы данных - Карта развития

## Обзор
Схема базы данных для системы обучения с последовательным открытием уроков на Supabase/PostgreSQL.

## Структура таблиц

### 1. users (Пользователи)
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 2. courses (Курсы)
```sql
CREATE TABLE courses (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 3. lessons (Уроки)
```sql
CREATE TABLE lessons (
  id SERIAL PRIMARY KEY,
  course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(course_id, order_index)
);
```

### 4. user_lesson_progress (Прогресс пользователя)
```sql
CREATE TABLE user_lesson_progress (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  lesson_id INTEGER REFERENCES lessons(id) ON DELETE CASCADE,
  status VARCHAR(20) CHECK (status IN ('not_started', 'completed')) DEFAULT 'not_started',
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, lesson_id)
);
```

## Основной запрос для получения списка уроков

```sql
SELECT 
  l.id,
  l.title,
  l.order_index,
  CASE 
    WHEN ulp.status = 'completed' THEN 'done'
    WHEN l.order_index = 1 OR EXISTS (
      SELECT 1 FROM lessons prev_l
      LEFT JOIN user_lesson_progress prev_ulp ON prev_l.id = prev_ulp.lesson_id AND prev_ulp.user_id = $1
      WHERE prev_l.course_id = l.course_id 
      AND prev_l.order_index = l.order_index - 1
      AND prev_ulp.status = 'completed'
    ) THEN 'active'
    ELSE 'locked'
  END as status
FROM lessons l
LEFT JOIN user_lesson_progress ulp ON l.id = ulp.lesson_id AND ulp.user_id = $1
WHERE l.course_id = $2
ORDER BY l.order_index;
```

## Индексы для производительности

```sql
CREATE INDEX idx_user_progress_user_id ON user_lesson_progress(user_id);
CREATE INDEX idx_lessons_course_order ON lessons(course_id, order_index);
```

## Политики безопасности (RLS)

```sql
ALTER TABLE user_lesson_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Пользователи видят только свой прогресс" ON user_lesson_progress
  FOR ALL USING (auth.uid() = user_id);
```

## Логика работы

1. **Первый урок** всегда доступен (`active`)
2. **Следующий урок** открывается только после завершения предыдущего
3. **Завершенные уроки** помечаются как `done`
4. **Заблокированные уроки** показываются как `locked`

## Пример данных

```sql
-- Создание курса
INSERT INTO courses (title) VALUES ('Карта развития');

-- Добавление уроков
INSERT INTO lessons (course_id, title, order_index) VALUES 
(1, 'Welcome Journey', 1),
(1, 'Переключение на себя', 2),
(1, 'Источник вдохновения', 3),
(1, 'Пространство идей', 4),
(1, 'Финальный тест', 5);

-- Прогресс пользователя (первый урок завершен)
INSERT INTO user_lesson_progress (user_id, lesson_id, status, completed_at) 
VALUES ('user-uuid', 1, 'completed', NOW());
```

Эта схема обеспечивает:
- ✅ Последовательное открытие уроков
- ✅ Быстрые запросы с правильными индексами  
- ✅ Безопасность данных через RLS
- ✅ Простоту масштабирования

## Примечания

Данная архитектура разработана для системы обучения с последовательным открытием уроков.