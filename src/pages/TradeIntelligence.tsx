import { useState } from 'react';
import { 
  TrendingUp, TrendingDown, AlertTriangle, Globe, 
  BarChart3, PieChart, ArrowRightLeft, Download,
  Filter, RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MemberLayout } from '@/layouts/MemberLayout';
import { 
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, PieChart as RePieChart, Pie, Cell,
  LineChart, Line, Legend
} from 'recharts';
import { 
  tradeMetrics, tradeFlows, countryIntelligence, 
  sectorReports, intelligenceAlerts, getMonthlyTradeData, getSectorDistribution 
} from '@/services/intelligenceService';
import { IntelligenceAlert } from '@/types/intelligence';

export default function TradeIntelligence() {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedCountry, setSelectedCountry] = useState('all');
  
  const monthlyData = getMonthlyTradeData();
  const sectorData = getSectorDistribution();

  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return `$${value}`;
  };

  const getAlertIcon = (type: IntelligenceAlert['type']) => {
    switch (type) {
      case 'trade_opportunity': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'risk_warning': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'policy_change': return <Globe className="h-4 w-4 text-blue-500" />;
      case 'market_shift': return <BarChart3 className="h-4 w-4 text-purple-500" />;
    }
  };

  const getAlertColor = (severity: IntelligenceAlert['severity']) => {
    switch (severity) {
      case 'critical': return 'border-l-red-500 bg-red-50';
      case 'high': return 'border-l-orange-500 bg-orange-50';
      case 'medium': return 'border-l-yellow-500 bg-yellow-50';
      case 'low': return 'border-l-blue-500 bg-blue-50';
    }
  };

  return (
    <MemberLayout>
      <div className="container mx-auto p-6 max-w-7xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-green-600 to-teal-600 rounded-xl">
            <BarChart3 className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Trade Intelligence</h1>
            <p className="text-muted-foreground">Market insights and analytics</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon">
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        {tradeMetrics.map((metric) => (
          <Card key={metric.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">{metric.label}</p>
              <p className="text-xl font-bold mt-1">{formatCurrency(metric.value)}</p>
              <div className={`flex items-center gap-1 mt-1 text-xs ${metric.changeType === 'increase' ? 'text-green-600' : metric.changeType === 'decrease' ? 'text-red-600' : 'text-muted-foreground'}`}>
                {metric.changeType === 'increase' ? <TrendingUp className="h-3 w-3" /> : metric.changeType === 'decrease' ? <TrendingDown className="h-3 w-3" /> : null}
                {metric.change > 0 ? '+' : ''}{metric.change}%
                <span className="text-muted-foreground ml-1">{metric.period}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="flows">Trade Flows</TabsTrigger>
          <TabsTrigger value="sectors">Sectors</TabsTrigger>
          <TabsTrigger value="countries">Countries</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Trade Volume Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={(v) => `$${v}M`} />
                    <Tooltip formatter={(v: number) => `$${v}M`} />
                    <Legend />
                    <Area type="monotone" dataKey="exports" stackId="1" stroke="#22c55e" fill="#22c55e" fillOpacity={0.6} name="Exports" />
                    <Area type="monotone" dataKey="imports" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} name="Imports" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Sector Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RePieChart>
                    <Pie
                      data={sectorData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ sector, value }) => `${sector}: ${value}%`}
                    >
                      {sectorData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RePieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Intelligence Alerts</CardTitle>
                <Badge variant="destructive">{intelligenceAlerts.filter(a => a.severity === 'critical' || a.severity === 'high').length} Active</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {intelligenceAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`p-4 rounded-lg border-l-4 ${getAlertColor(alert.severity)}`}
                  >
                    <div className="flex items-start gap-3">
                      {getAlertIcon(alert.type)}
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{alert.title}</h4>
                          <Badge variant={alert.severity === 'critical' || alert.severity === 'high' ? 'destructive' : 'secondary'} className="text-xs">
                            {alert.severity}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{alert.description}</p>
                        <div className="flex gap-2 mt-2">
                          {alert.relatedCountries.map(c => (
                            <Badge key={c} variant="outline" className="text-xs">{c}</Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="flows" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <ArrowRightLeft className="h-5 w-5" />
                Cross-Border Trade Flows
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={tradeFlows} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" tickFormatter={(v) => `$${v/1000}K`} />
                  <YAxis type="category" dataKey="from" width={80} />
                  <Tooltip formatter={(v: number) => formatCurrency(v)} />
                  <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {tradeFlows.slice(0, 4).map((flow) => (
              <Card key={flow.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm">
                      <span className="font-medium">{flow.from}</span>
                      <span className="text-muted-foreground mx-2">→</span>
                      <span className="font-medium">{flow.to}</span>
                    </div>
                    <Badge variant={flow.status === 'growing' ? 'default' : flow.status === 'declining' ? 'destructive' : 'secondary'}>
                      {flow.status}
                    </Badge>
                  </div>
                  <p className="text-lg font-bold">{formatCurrency(flow.value)}</p>
                  <p className="text-xs text-muted-foreground">{flow.volume} deals • {flow.sector}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="sectors" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sectorReports.map((sector) => (
              <Card key={sector.sector} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{sector.sector}</CardTitle>
                    <Badge variant={sector.priceTrend === 'up' ? 'default' : sector.priceTrend === 'down' ? 'destructive' : 'secondary'}>
                      {sector.priceTrend === 'up' ? '↑ Price Up' : sector.priceTrend === 'down' ? '↓ Price Down' : '→ Stable'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Global Demand</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-green-500" style={{ width: `${sector.globalDemand}%` }} />
                        </div>
                        <span className="text-sm font-medium">{sector.globalDemand}%</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Regional Demand</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-blue-500" style={{ width: `${sector.regionalDemand}%` }} />
                        </div>
                        <span className="text-sm font-medium">{sector.regionalDemand}%</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs font-medium text-green-600">Opportunities</p>
                      <ul className="text-xs text-muted-foreground mt-1">
                        {sector.opportunities.map((opp, i) => (
                          <li key={i}>• {opp}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-red-600">Threats</p>
                      <ul className="text-xs text-muted-foreground mt-1">
                        {sector.threats.map((threat, i) => (
                          <li key={i}>• {threat}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="countries" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {countryIntelligence.map((country) => (
              <Card key={country.country}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{country.country}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-xs text-muted-foreground">Exports</span>
                      <span className="text-sm font-medium text-green-600">{formatCurrency(country.totalExports)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-muted-foreground">Imports</span>
                      <span className="text-sm font-medium text-blue-600">{formatCurrency(country.totalImports)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-muted-foreground">Growth</span>
                      <span className="text-sm font-medium">+{country.growthRate}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-muted-foreground">Risk Score</span>
                      <Badge variant={country.riskScore < 30 ? 'default' : country.riskScore < 50 ? 'secondary' : 'destructive'}>
                        {country.riskScore}/100
                      </Badge>
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-xs text-muted-foreground mb-2">Top Sectors</p>
                    <div className="flex flex-wrap gap-1">
                      {country.topSectors.map(s => (
                        <Badge key={s} variant="outline" className="text-xs">{s}</Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
      </div>
    </MemberLayout>
  );
}
