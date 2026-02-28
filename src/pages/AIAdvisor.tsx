import { useState, useRef, useEffect } from 'react';
import { Send, Bot, Sparkles, TrendingUp, AlertTriangle, Lightbulb, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { MemberLayout } from '@/layouts/MemberLayout';
import { AdvisorMessage, TradeInsight } from '@/types/advisor';
import { sendMessageToAdvisor, getTradeInsights, getQuickReplies, getMarketData } from '@/services/advisorService';
import { MarketData } from '@/types/advisor';
import { useAuth } from '@/contexts/AuthContext';
import { businesses } from '@/data/mockData';

export default function AIAdvisor() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<AdvisorMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Hello${user?.name ? `, ${user.name}` : ''}! I'm your DIL Trade Advisor, powered by AI. I can help you with:\n\n• Finding the right trade partners\n• Market intelligence and commodity prices\n• Trade deal guidance and escrow processes\n• Documentation requirements\n• Risk analysis for deals\n\nWhat would you like to explore today?`,
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [insights, setInsights] = useState<TradeInsight[]>([]);
  const [marketData, setMarketData] = useState<MarketData[]>([]);
  const [selectedInsight, setSelectedInsight] = useState<TradeInsight | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentUser = businesses[0];

  useEffect(() => {
    getTradeInsights({ businessId: currentUser.id }).then(setInsights);
    getMarketData().then(setMarketData);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    
    const userMessage: AdvisorMessage = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content: input,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    try {
      const response = await sendMessageToAdvisor(
        input,
        { 
          businessId: currentUser.id,
          currentSector: currentUser.sectors[0],
          targetMarkets: currentUser.preferredMarkets,
          membershipTier: 'growth'
        },
        messages
      );
      setMessages(prev => [...prev, response]);
    } catch (error) {
      console.error('Advisor error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickReply = (text: string) => {
    setInput(text);
  };

  const getInsightIcon = (type: TradeInsight['type']) => {
    switch (type) {
      case 'opportunity': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'risk': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'recommendation': return <Lightbulb className="h-4 w-4 text-yellow-500" />;
      case 'market_trend': return <TrendingUp className="h-4 w-4 text-blue-500" />;
    }
  };

  const getSeverityColor = (severity: TradeInsight['severity']) => {
    switch (severity) {
      case 'high': return 'border-red-200 bg-red-50';
      case 'medium': return 'border-yellow-200 bg-yellow-50';
      case 'low': return 'border-green-200 bg-green-50';
    }
  };

  return (
    <MemberLayout>
      <div className="container mx-auto p-6 max-w-7xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl">
          <Bot className="h-8 w-8 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">AI Trade Advisor</h1>
          <p className="text-muted-foreground">Your intelligent trade assistant</p>
        </div>
        <Badge variant="secondary" className="ml-auto gap-1">
          <Sparkles className="h-3 w-3" />
          AI-Powered
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="h-[700px] flex flex-col">
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-purple-600" />
                Trade Advisor Chat
              </CardTitle>
            </CardHeader>
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className={message.role === 'assistant' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}>
                        {message.role === 'assistant' ? 'AI' : user?.name?.[0] || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div
                      className={`rounded-lg px-4 py-2 max-w-[80%] ${
                        message.role === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-muted'
                      }`}
                    >
                      <p className="whitespace-pre-line text-sm">{message.content}</p>
                      <span className={`text-xs mt-1 block ${message.role === 'user' ? 'text-blue-100' : 'text-muted-foreground'}`}>
                        {message.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-purple-100 text-purple-600">AI</AvatarFallback>
                    </Avatar>
                    <div className="bg-muted rounded-lg px-4 py-2">
                      <div className="flex gap-1">
                        <span className="h-2 w-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                        <span className="h-2 w-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                        <span className="h-2 w-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
            <div className="p-4 border-t">
              <div className="flex gap-2 mb-3">
                {getQuickReplies().slice(0, 4).map((reply, i) => (
                  <Button
                    key={i}
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickReply(reply)}
                    className="text-xs"
                    disabled={isLoading}
                  >
                    {reply}
                  </Button>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Ask about trade opportunities, market prices, or deal guidance..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  disabled={isLoading}
                />
                <Button onClick={handleSend} disabled={isLoading || !input.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Tabs defaultValue="insights" className="h-[700px] flex flex-col">
            <TabsList className="w-full">
              <TabsTrigger value="insights" className="flex-1">Insights</TabsTrigger>
              <TabsTrigger value="markets" className="flex-1">Markets</TabsTrigger>
            </TabsList>
            
            <TabsContent value="insights" className="flex-1 overflow-hidden">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="text-lg">Trade Insights</CardTitle>
                </CardHeader>
                <ScrollArea className="h-[500px] p-4">
                  <div className="space-y-3">
                    {insights.map((insight) => (
                      <div
                        key={insight.id}
                        onClick={() => setSelectedInsight(insight)}
                        className={`p-3 rounded-lg border cursor-pointer transition-all hover:shadow-md ${getSeverityColor(insight.severity)}`}
                      >
                        <div className="flex items-start gap-2">
                          {getInsightIcon(insight.type)}
                          <div className="flex-1">
                            <h4 className="font-medium text-sm">{insight.title}</h4>
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                              {insight.description}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-1 mt-2">
                          {insight.sector && (
                            <Badge variant="outline" className="text-xs">{insight.sector}</Badge>
                          )}
                          {insight.region && (
                            <Badge variant="outline" className="text-xs">{insight.region}</Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </Card>
            </TabsContent>
            
            <TabsContent value="markets" className="flex-1 overflow-hidden">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="text-lg">Commodity Prices</CardTitle>
                  <p className="text-xs text-muted-foreground">Real-time market data</p>
                </CardHeader>
                <ScrollArea className="h-[500px] p-4">
                  <div className="space-y-2">
                    {marketData.map((item, i) => (
                      <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                        <div>
                          <p className="font-medium text-sm">{item.commodity}</p>
                          <p className="text-xs text-muted-foreground">{item.region}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">${item.currentPrice.toLocaleString()}</p>
                          <p className={`text-xs flex items-center gap-1 ${item.trend === 'up' ? 'text-green-600' : item.trend === 'down' ? 'text-red-600' : 'text-muted-foreground'}`}>
                            {item.trend === 'up' ? '↑' : item.trend === 'down' ? '↓' : '→'} {item.priceChange > 0 ? '+' : ''}{item.priceChange}%
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </Card>
            </TabsContent>
          </Tabs>

          {selectedInsight && (
            <Card className="border-purple-200">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Insight Details</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedInsight(null)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <h4 className="font-medium mb-2">{selectedInsight.title}</h4>
                <p className="text-sm text-muted-foreground mb-3">{selectedInsight.description}</p>
                {selectedInsight.actionableSteps && (
                  <div>
                    <p className="text-xs font-medium mb-2">Recommended Actions:</p>
                    <ul className="text-xs space-y-1">
                      {selectedInsight.actionableSteps.map((step, i) => (
                        <li key={i} className="flex gap-2">
                          <span className="text-purple-600">•</span>
                          {step}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      </div>
    </MemberLayout>
  );
}
