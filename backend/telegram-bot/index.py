import json
import os
import psycopg2
from datetime import datetime, timedelta

def handler(event: dict, context) -> dict:
    """API для обработки Telegram Bot вебхуков и управления модерацией"""
    
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            'body': ''
        }
    
    dsn = os.environ.get('DATABASE_URL')
    conn = psycopg2.connect(dsn)
    cur = conn.cursor()
    
    try:
        query_params = event.get('queryStringParameters') or {}
        action = query_params.get('action', 'stats')
        
        if method == 'POST':
            body = json.loads(event.get('body', '{}'))
            result = process_telegram_update(body, cur, conn)
            
        elif method == 'GET' and action == 'logs':
            cur.execute("""
                SELECT action_type, user_id, username, reason, chat_id, created_at 
                FROM moderation_logs 
                ORDER BY created_at DESC 
                LIMIT 50
            """)
            logs = cur.fetchall()
            result = {
                'logs': [
                    {
                        'action': row[0],
                        'user_id': row[1],
                        'username': row[2],
                        'reason': row[3],
                        'chat_id': row[4],
                        'created_at': row[5].isoformat() if row[5] else None
                    }
                    for row in logs
                ]
            }
            
        elif method == 'GET' and action == 'stats':
            cur.execute("""
                SELECT 
                    (SELECT COUNT(*) FROM moderation_logs WHERE action_type = 'kick' AND DATE(created_at) = CURRENT_DATE) as today_bans,
                    (SELECT COUNT(*) FROM user_warnings WHERE is_muted = true) as current_mutes,
                    (SELECT COUNT(*) FROM moderation_logs WHERE action_type = 'warn' AND DATE(created_at) = CURRENT_DATE) as today_warns,
                    (SELECT COUNT(*) FROM moderation_logs WHERE action_type = 'remove' AND DATE(created_at) = CURRENT_DATE) as today_removes
            """)
            stats = cur.fetchone()
            result = {
                'today_bans': stats[0] or 0,
                'current_mutes': stats[1] or 0,
                'today_warns': stats[2] or 0,
                'today_removes': stats[3] or 0
            }
            
        elif method == 'GET' and action == 'daily-stats':
            cur.execute("""
                SELECT stat_date, total_bans, total_mutes, total_warns, total_removes
                FROM daily_stats
                ORDER BY stat_date DESC
                LIMIT 30
            """)
            daily = cur.fetchall()
            result = {
                'daily_stats': [
                    {
                        'date': row[0].isoformat(),
                        'bans': row[1],
                        'mutes': row[2],
                        'warns': row[3],
                        'removes': row[4]
                    }
                    for row in daily
                ]
            }
            
        elif method == 'GET' and action == 'settings':
            cur.execute("SELECT setting_key, setting_value FROM bot_settings")
            settings = cur.fetchall()
            result = {row[0]: row[1] for row in settings}
            
        elif method == 'PUT' and action == 'settings':
            body = json.loads(event.get('body', '{}'))
            for key, value in body.items():
                cur.execute("""
                    INSERT INTO bot_settings (setting_key, setting_value, updated_at) 
                    VALUES (%s, %s, %s)
                    ON CONFLICT (setting_key) 
                    DO UPDATE SET setting_value = %s, updated_at = %s
                """, (key, str(value), datetime.now(), str(value), datetime.now()))
            conn.commit()
            result = {'success': True, 'message': 'Settings updated'}
            
        elif method == 'GET' and action == 'filters':
            filter_type = event.get('queryStringParameters', {}).get('type', 'spam')
            cur.execute("""
                SELECT word FROM word_filters 
                WHERE filter_type = %s AND is_active = true
            """, (filter_type,))
            words = cur.fetchall()
            result = {'words': [row[0] for row in words]}
            
        elif method == 'POST' and action == 'filters':
            body = json.loads(event.get('body', '{}'))
            filter_type = body.get('type', 'spam')
            words = body.get('words', [])
            
            for word in words:
                cur.execute("""
                    INSERT INTO word_filters (filter_type, word) 
                    VALUES (%s, %s)
                    ON CONFLICT DO NOTHING
                """, (filter_type, word))
            conn.commit()
            result = {'success': True, 'added': len(words)}
            
        else:
            result = {'error': 'Unknown endpoint'}
            
        cur.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps(result)
        }
        
    except Exception as e:
        if cur:
            cur.close()
        if conn:
            conn.close()
        
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': str(e)})
        }


def process_telegram_update(update: dict, cur, conn) -> dict:
    """Обработка входящего обновления от Telegram"""
    
    if 'message' not in update:
        return {'success': True, 'action': 'ignored'}
    
    message = update['message']
    text = message.get('text', '').lower()
    user_id = message['from']['id']
    username = message['from'].get('username', f"user_{user_id}")
    chat_id = message['chat']['id']
    
    cur.execute("SELECT setting_value FROM bot_settings WHERE setting_key = 'mute_duration_minutes'")
    mute_duration = int(cur.fetchone()[0])
    
    cur.execute("SELECT word FROM word_filters WHERE filter_type = 'spam' AND is_active = true")
    spam_words = [row[0].lower() for row in cur.fetchall()]
    
    cur.execute("SELECT word FROM word_filters WHERE filter_type = 'profanity' AND is_active = true")
    bad_words = [row[0].lower() for row in cur.fetchall()]
    
    action_taken = None
    reason = None
    
    for spam_word in spam_words:
        if spam_word in text:
            action_taken = 'remove'
            reason = f'Спам: {spam_word}'
            break
    
    if not action_taken:
        for bad_word in bad_words:
            if bad_word in text:
                action_taken = 'mute'
                reason = f'Мат: {bad_word}'
                
                mute_until = datetime.now() + timedelta(minutes=mute_duration)
                cur.execute("""
                    INSERT INTO user_warnings (user_id, username, warning_count, last_warning_at, is_muted, mute_until)
                    VALUES (%s, %s, 1, %s, true, %s)
                    ON CONFLICT (user_id) 
                    DO UPDATE SET 
                        warning_count = user_warnings.warning_count + 1,
                        last_warning_at = %s,
                        is_muted = true,
                        mute_until = %s
                """, (user_id, username, datetime.now(), mute_until, datetime.now(), mute_until))
                break
    
    if action_taken:
        cur.execute("""
            INSERT INTO moderation_logs (action_type, user_id, username, reason, chat_id, created_at)
            VALUES (%s, %s, %s, %s, %s, %s)
        """, (action_taken, user_id, username, reason, chat_id, datetime.now()))
        
        cur.execute("""
            INSERT INTO daily_stats (stat_date, total_bans, total_mutes, total_warns, total_removes)
            VALUES (CURRENT_DATE, 0, 0, 0, 0)
            ON CONFLICT (stat_date) DO NOTHING
        """)
        
        if action_taken == 'mute':
            cur.execute("""
                UPDATE daily_stats 
                SET total_mutes = total_mutes + 1 
                WHERE stat_date = CURRENT_DATE
            """)
        elif action_taken == 'remove':
            cur.execute("""
                UPDATE daily_stats 
                SET total_removes = total_removes + 1 
                WHERE stat_date = CURRENT_DATE
            """)
        
        conn.commit()
    
    return {
        'success': True,
        'action': action_taken or 'none',
        'reason': reason
    }