import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import Icon from '@/components/ui/icon';

const API_URL = 'https://functions.poehali.dev/764e4b68-3062-40ac-886c-8fd380508455';

const Index = () => {
  const [mutDuration, setMutDuration] = useState('60');
  const [spamWords, setSpamWords] = useState('реклама\nспам\nскидка\nбесплатно');
  const [badWords, setBadWords] = useState('');
  const [statsData, setStatsData] = useState([
    { label: 'Заблокировано сегодня', value: '0', icon: 'UserX', color: 'text-destructive' },
    { label: 'В муте сейчас', value: '0', icon: 'MessageSquareOff', color: 'text-orange-500' },
    { label: 'Предупреждений', value: '0', icon: 'AlertTriangle', color: 'text-yellow-500' },
    { label: 'Очищено сообщений', value: '0', icon: 'Trash2', color: 'text-primary' }
  ]);
  const [recentLogs, setRecentLogs] = useState<any[]>([]);
  const [dailyStats, setDailyStats] = useState<any[]>([]);

  useEffect(() => {
    fetchStats();
    fetchLogs();
    fetchDailyStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_URL}?action=stats`);
      const data = await response.json();
      setStatsData([
        { label: 'Заблокировано сегодня', value: String(data.today_bans || 0), icon: 'UserX', color: 'text-destructive' },
        { label: 'В муте сейчас', value: String(data.current_mutes || 0), icon: 'MessageSquareOff', color: 'text-orange-500' },
        { label: 'Предупреждений', value: String(data.today_warns || 0), icon: 'AlertTriangle', color: 'text-yellow-500' },
        { label: 'Очищено сообщений', value: String(data.today_removes || 0), icon: 'Trash2', color: 'text-primary' }
      ]);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const fetchLogs = async () => {
    try {
      const response = await fetch(`${API_URL}?action=logs`);
      const data = await response.json();
      const logs = data.logs.slice(0, 5).map((log: any) => ({
        action: getActionLabel(log.action),
        user: log.username,
        reason: log.reason,
        time: formatTime(log.created_at),
        type: log.action
      }));
      setRecentLogs(logs);
    } catch (error) {
      console.error('Failed to fetch logs:', error);
    }
  };

  const fetchDailyStats = async () => {
    try {
      const response = await fetch(`${API_URL}?action=daily-stats`);
      const data = await response.json();
      setDailyStats(data.daily_stats || []);
    } catch (error) {
      console.error('Failed to fetch daily stats:', error);
    }
  };

  const getActionLabel = (action: string) => {
    const labels: any = {
      'mute': 'Мут',
      'kick': 'Кик',
      'warn': 'Предупреждение',
      'remove': 'Удаление'
    };
    return labels[action] || action;
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 60) return `${diffMins} мин назад`;
    if (diffHours < 24) return `${diffHours} ч назад`;
    return `${diffDays} д назад`;
  };

  const getActionColor = (type: string) => {
    switch (type) {
      case 'kick': return 'bg-destructive/20 text-destructive';
      case 'mute': return 'bg-orange-500/20 text-orange-500';
      case 'warn': return 'bg-yellow-500/20 text-yellow-500';
      case 'delete': return 'bg-primary/20 text-primary';
      case 'remove': return 'bg-primary/20 text-primary';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold flex items-center gap-3">
              <span className="text-5xl">🐱</span>
              <span>Барсик Модератор</span>
            </h1>
            <p className="text-muted-foreground mt-2">Панель управления модерацией</p>
          </div>
          <Badge variant="outline" className="text-sm px-4 py-2">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" />
            Бот активен
          </Badge>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {statsData.map((stat, index) => (
            <Card key={index} className="hover-scale cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.label}
                </CardTitle>
                <Icon name={stat.icon as any} className={stat.color} size={20} />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="analytics" className="space-y-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="analytics">
              <Icon name="BarChart3" size={16} className="mr-2" />
              Аналитика
            </TabsTrigger>
            <TabsTrigger value="logs">
              <Icon name="ScrollText" size={16} className="mr-2" />
              Логи
            </TabsTrigger>
            <TabsTrigger value="filters">
              <Icon name="Filter" size={16} className="mr-2" />
              Фильтры
            </TabsTrigger>
            <TabsTrigger value="settings">
              <Icon name="Settings" size={16} className="mr-2" />
              Настройки
            </TabsTrigger>
            <TabsTrigger value="commands">
              <Icon name="Terminal" size={16} className="mr-2" />
              Команды
            </TabsTrigger>
          </TabsList>

          <TabsContent value="analytics" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Статистика нарушений за последние 30 дней</CardTitle>
                <CardDescription>
                  График активности модерации по дням
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  {dailyStats.slice(0, 14).reverse().map((stat, index) => {
                    const total = stat.bans + stat.mutes + stat.warns + stat.removes;
                    const maxValue = Math.max(...dailyStats.map((s: any) => s.bans + s.mutes + s.warns + s.removes));
                    
                    return (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground min-w-[100px]">
                            {new Date(stat.date).toLocaleDateString('ru-RU', { day: '2-digit', month: 'short' })}
                          </span>
                          <div className="flex-1 mx-4">
                            <div className="h-8 bg-muted rounded-lg overflow-hidden flex">
                              <div 
                                className="bg-destructive transition-all"
                                style={{ width: `${(stat.bans / maxValue) * 100}%` }}
                                title={`Баны: ${stat.bans}`}
                              />
                              <div 
                                className="bg-orange-500 transition-all"
                                style={{ width: `${(stat.mutes / maxValue) * 100}%` }}
                                title={`Муты: ${stat.mutes}`}
                              />
                              <div 
                                className="bg-yellow-500 transition-all"
                                style={{ width: `${(stat.warns / maxValue) * 100}%` }}
                                title={`Предупреждения: ${stat.warns}`}
                              />
                              <div 
                                className="bg-primary transition-all"
                                style={{ width: `${(stat.removes / maxValue) * 100}%` }}
                                title={`Удаления: ${stat.removes}`}
                              />
                            </div>
                          </div>
                          <span className="font-semibold min-w-[40px] text-right">{total}</span>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground ml-[100px]">
                          <span className="flex items-center gap-1">
                            <div className="w-3 h-3 rounded bg-destructive" />
                            Баны: {stat.bans}
                          </span>
                          <span className="flex items-center gap-1">
                            <div className="w-3 h-3 rounded bg-orange-500" />
                            Муты: {stat.mutes}
                          </span>
                          <span className="flex items-center gap-1">
                            <div className="w-3 h-3 rounded bg-yellow-500" />
                            Варны: {stat.warns}
                          </span>
                          <span className="flex items-center gap-1">
                            <div className="w-3 h-3 rounded bg-primary" />
                            Удалено: {stat.removes}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Топ нарушителей</CardTitle>
                  <CardDescription>Пользователи с наибольшим количеством нарушений</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {recentLogs.slice(0, 5).map((log, index) => (
                      <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-destructive/20 flex items-center justify-center text-sm font-bold">
                            {index + 1}
                          </div>
                          <span className="font-medium">{log.user}</span>
                        </div>
                        <Badge variant="outline">{log.action}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Распределение нарушений</CardTitle>
                  <CardDescription>По типам за весь период</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { label: 'Баны', value: dailyStats.reduce((sum: number, s: any) => sum + s.bans, 0), color: 'bg-destructive' },
                      { label: 'Муты', value: dailyStats.reduce((sum: number, s: any) => sum + s.mutes, 0), color: 'bg-orange-500' },
                      { label: 'Предупреждения', value: dailyStats.reduce((sum: number, s: any) => sum + s.warns, 0), color: 'bg-yellow-500' },
                      { label: 'Удалено сообщений', value: dailyStats.reduce((sum: number, s: any) => sum + s.removes, 0), color: 'bg-primary' }
                    ].map((item, index) => {
                      const total = dailyStats.reduce((sum: number, s: any) => sum + s.bans + s.mutes + s.warns + s.removes, 0);
                      const percentage = total > 0 ? (item.value / total) * 100 : 0;
                      
                      return (
                        <div key={index} className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span>{item.label}</span>
                            <span className="font-semibold">{item.value}</span>
                          </div>
                          <div className="h-3 bg-muted rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${item.color} transition-all`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground">{percentage.toFixed(1)}%</span>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="logs" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>История модерации</CardTitle>
                <CardDescription>
                  Последние действия бота в режиме реального времени
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px] pr-4">
                  <div className="space-y-3">
                    {recentLogs.map((log, index) => (
                      <div key={index} className="flex items-start gap-4 p-4 rounded-lg bg-card border hover:bg-accent/50 transition-colors">
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                            <Badge className={getActionColor(log.type)}>
                              {log.action}
                            </Badge>
                            <span className="font-semibold">{log.user}</span>
                          </div>
                          <p className="text-sm text-muted-foreground">{log.reason}</p>
                        </div>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {log.time}
                        </span>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="filters" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Фильтр спама</CardTitle>
                  <CardDescription>
                    Слова и фразы, которые будут удаляться автоматически
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="spam-words">Список слов (по одному на строку)</Label>
                    <Textarea
                      id="spam-words"
                      placeholder="Введите слова..."
                      className="min-h-[200px] font-mono"
                      value={spamWords}
                      onChange={(e) => setSpamWords(e.target.value)}
                    />
                  </div>
                  <Button className="w-full">
                    <Icon name="Save" size={16} className="mr-2" />
                    Сохранить список
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Фильтр мата</CardTitle>
                  <CardDescription>
                    Нецензурные слова для автоматической модерации
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="bad-words">Список матерных слов</Label>
                    <Textarea
                      id="bad-words"
                      placeholder="Введите слова..."
                      className="min-h-[200px] font-mono"
                      value={badWords}
                      onChange={(e) => setBadWords(e.target.value)}
                    />
                  </div>
                  <Button className="w-full">
                    <Icon name="Save" size={16} className="mr-2" />
                    Сохранить список
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Наказания за нарушения</CardTitle>
                  <CardDescription>
                    Настройка действий при обнаружении запрещённого контента
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Мут за мат</Label>
                        <p className="text-sm text-muted-foreground">
                          Временное ограничение на отправку сообщений
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <Separator />
                    <div className="space-y-2">
                      <Label htmlFor="mute-duration">Длительность мута (минуты)</Label>
                      <Input
                        id="mute-duration"
                        type="number"
                        value={mutDuration}
                        onChange={(e) => setMutDuration(e.target.value)}
                      />
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Кик за повторный мат</Label>
                        <p className="text-sm text-muted-foreground">
                          Удаление из чата при повторных нарушениях
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Автоудаление спама</Label>
                        <p className="text-sm text-muted-foreground">
                          Мгновенное удаление сообщений со спамом
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Дополнительные параметры</CardTitle>
                  <CardDescription>
                    Настройка поведения бота
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Предупреждения перед баном</Label>
                      <p className="text-sm text-muted-foreground">
                        Давать предупреждения перед киком
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Логировать действия</Label>
                      <p className="text-sm text-muted-foreground">
                        Сохранять историю всех действий
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Уведомления админам</Label>
                      <p className="text-sm text-muted-foreground">
                        Отправлять сообщения о действиях модерации
                      </p>
                    </div>
                    <Switch />
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label htmlFor="max-warnings">Макс. предупреждений до кика</Label>
                    <Input
                      id="max-warnings"
                      type="number"
                      defaultValue="3"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline">Отменить</Button>
              <Button>
                <Icon name="Save" size={16} className="mr-2" />
                Сохранить все настройки
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="commands" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Команды модератора</CardTitle>
                <CardDescription>
                  Команды для управления ботом в Telegram
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid gap-3">
                    {[
                      { cmd: '/ban @user', desc: 'Забанить пользователя навсегда' },
                      { cmd: '/mute @user [минуты]', desc: 'Ограничить возможность писать на время' },
                      { cmd: '/unmute @user', desc: 'Снять мут с пользователя' },
                      { cmd: '/kick @user', desc: 'Кикнуть пользователя из чата' },
                      { cmd: '/warn @user', desc: 'Выдать предупреждение пользователю' },
                      { cmd: '/clear [число]', desc: 'Удалить последние N сообщений' },
                      { cmd: '/stats', desc: 'Показать статистику модерации' },
                      { cmd: '/filters', desc: 'Управление фильтрами слов' }
                    ].map((item, index) => (
                      <div key={index} className="flex items-start gap-4 p-4 rounded-lg bg-muted/50 border">
                        <code className="text-primary font-mono text-sm bg-background px-3 py-1 rounded min-w-[200px]">
                          {item.cmd}
                        </code>
                        <span className="text-sm text-muted-foreground">{item.desc}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Информация о боте</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <span className="text-sm text-muted-foreground">Имя бота</span>
                  <span className="font-mono">@barsik_moderator_bot</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <span className="text-sm text-muted-foreground">Версия</span>
                  <Badge variant="outline">v1.0.0</Badge>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <span className="text-sm text-muted-foreground">Активен с</span>
                  <span>16.01.2026</span>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;