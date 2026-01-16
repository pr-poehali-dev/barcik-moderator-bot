-- Создание таблиц для бота-модератора Барсик

-- Таблица настроек бота
CREATE TABLE bot_settings (
    id SERIAL PRIMARY KEY,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица логов модерации
CREATE TABLE moderation_logs (
    id SERIAL PRIMARY KEY,
    action_type VARCHAR(50) NOT NULL,
    user_id BIGINT NOT NULL,
    username VARCHAR(255),
    reason TEXT,
    chat_id BIGINT NOT NULL,
    moderator_id BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица фильтров (спам и мат)
CREATE TABLE word_filters (
    id SERIAL PRIMARY KEY,
    filter_type VARCHAR(20) NOT NULL,
    word TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица статистики по дням
CREATE TABLE daily_stats (
    id SERIAL PRIMARY KEY,
    stat_date DATE NOT NULL UNIQUE,
    total_bans INTEGER DEFAULT 0,
    total_mutes INTEGER DEFAULT 0,
    total_warns INTEGER DEFAULT 0,
    total_removes INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица пользователей с предупреждениями
CREATE TABLE user_warnings (
    id SERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    username VARCHAR(255),
    warning_count INTEGER DEFAULT 0,
    last_warning_at TIMESTAMP,
    is_muted BOOLEAN DEFAULT false,
    mute_until TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id)
);

-- Создание индексов для быстрого поиска
CREATE INDEX idx_moderation_logs_user ON moderation_logs(user_id);
CREATE INDEX idx_moderation_logs_date ON moderation_logs(created_at);
CREATE INDEX idx_daily_stats_date ON daily_stats(stat_date);
CREATE INDEX idx_user_warnings_user ON user_warnings(user_id);

-- Вставка дефолтных настроек
INSERT INTO bot_settings (setting_key, setting_value) VALUES
    ('mute_duration_minutes', '60'),
    ('max_warnings_before_kick', '3'),
    ('auto_remove_spam', 'true'),
    ('mute_for_profanity', 'true'),
    ('kick_for_repeated_profanity', 'true'),
    ('send_warnings_before_ban', 'true'),
    ('log_actions', 'true'),
    ('notify_admins', 'false'),
    ('bot_token', '8491771696:AAHQMknPMlGwKlRkW63IaiBIlm7diFwdnxA');

-- Вставка тестовых данных для фильтров
INSERT INTO word_filters (filter_type, word) VALUES
    ('spam', 'реклама'),
    ('spam', 'спам'),
    ('spam', 'скидка'),
    ('spam', 'бесплатно');

-- Вставка тестовых логов
INSERT INTO moderation_logs (action_type, user_id, username, reason, chat_id) VALUES
    ('mute', 123456, '@user123', 'Мат в сообщении', -1001234567890),
    ('kick', 234567, '@spammer456', 'Спам (3 нарушение)', -1001234567890),
    ('warn', 345678, '@newbie789', 'Нецензурная лексика', -1001234567890),
    ('remove', 456789, '@advertiser321', 'Реклама', -1001234567890),
    ('mute', 567890, '@toxic999', 'Оскорбления', -1001234567890);

-- Вставка тестовой статистики за последние 7 дней
INSERT INTO daily_stats (stat_date, total_bans, total_mutes, total_warns, total_removes) VALUES
    (CURRENT_DATE - INTERVAL '6 days', 2, 5, 8, 23),
    (CURRENT_DATE - INTERVAL '5 days', 3, 7, 12, 31),
    (CURRENT_DATE - INTERVAL '4 days', 1, 4, 6, 18),
    (CURRENT_DATE - INTERVAL '3 days', 4, 9, 15, 42),
    (CURRENT_DATE - INTERVAL '2 days', 2, 6, 10, 28),
    (CURRENT_DATE - INTERVAL '1 day', 3, 8, 14, 35),
    (CURRENT_DATE, 12, 5, 28, 156);