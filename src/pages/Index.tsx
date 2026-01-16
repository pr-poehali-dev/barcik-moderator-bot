import { useState } from 'react';
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

const Index = () => {
  const [mutDuration, setMutDuration] = useState('60');
  const [spamWords, setSpamWords] = useState('реклама\nспам\nскидка\nбесплатно');
  const [badWords, setBadWords] = useState('');

  const statsData = [
    { label: 'Заблокировано сегодня', value: '12', icon: 'UserX', color: 'text-destructive' },
    { label: 'В муте сейчас', value: '5', icon: 'MessageSquareOff', color: 'text-orange-500' },
    { label: 'Предупреждений', value: '28', icon: 'AlertTriangle', color: 'text-yellow-500' },
    { label: 'Очищено сообщений', value: '156', icon: 'Trash2', color: 'text-primary' }
  ];

  const recentLogs = [
    { action: 'Мут', user: '@user123', reason: 'Мат в сообщении', time: '2 мин назад', type: 'mute' },
    { action: 'Кик', user: '@spammer456', reason: 'Спам (3 нарушение)', time: '15 мин назад', type: 'kick' },
    { action: 'Предупреждение', user: '@newbie789', reason: 'Нецензурная лексика', time: '28 мин назад', type: 'warn' },
    { action: 'Удаление', user: '@advertiser321', reason: 'Реклама', time: '1 ч назад', type: 'delete' },
    { action: 'Мут', user: '@toxic999', reason: 'Оскорбления', time: '2 ч назад', type: 'mute' }
  ];

  const getActionColor = (type: string) => {
    switch (type) {
      case 'kick': return 'bg-destructive/20 text-destructive';
      case 'mute': return 'bg-orange-500/20 text-orange-500';
      case 'warn': return 'bg-yellow-500/20 text-yellow-500';
      case 'delete': return 'bg-primary/20 text-primary';
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

        <Tabs defaultValue="logs" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
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
