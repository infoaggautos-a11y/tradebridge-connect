import { useState } from 'react';
import { 
  Mail, Users, Send, BarChart3, Plus, Edit, Trash2, 
  Play, Pause, Copy, Search, MoreHorizontal, Clock, 
  CheckCircle, XCircle, Zap
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { AdminLayout } from '@/layouts/AdminLayout';
import { 
  campaigns, workflows, audienceStats, campaignMetrics, 
  emailTemplates, getTriggerLabel, getAudienceLabel 
} from '@/services/marketingService';
import { CampaignStatus, TriggerType, AudienceSegment } from '@/types/marketing';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function MarketingAutomation() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateCampaignOpen, setIsCreateCampaignOpen] = useState(false);
  const [isCreateWorkflowOpen, setIsCreateWorkflowOpen] = useState(false);

  const filteredCampaigns = campaigns.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: CampaignStatus) => {
    const variants: Record<CampaignStatus, 'secondary' | 'outline' | 'default' | 'destructive'> = {
      draft: 'secondary',
      scheduled: 'outline',
      active: 'default',
      paused: 'destructive',
      completed: 'secondary',
    };
    return <Badge variant={variants[status]}>{status}</Badge>;
  };

  const totalStats = {
    sent: campaigns.reduce((sum, c) => sum + c.sentAt ? c.recipients : 0, 0),
    opens: campaigns.reduce((sum, c) => sum + c.opens, 0),
    clicks: campaigns.reduce((sum, c) => sum + c.clicks, 0),
    conversions: campaigns.reduce((sum, c) => sum + c.conversions, 0),
  };

  return (
    <AdminLayout>
      <div className="container mx-auto p-6 max-w-7xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-pink-600 to-rose-600 rounded-xl">
            <Mail className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Marketing Automation</h1>
            <p className="text-muted-foreground">Email campaigns and automated workflows</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Members</p>
                <p className="text-xl font-bold">{audienceStats.totalMembers.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Active</p>
                <p className="text-xl font-bold">{audienceStats.activeMembers.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Mail className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Sent (Month)</p>
                <p className="text-xl font-bold">{totalStats.sent.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <BarChart3 className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Open Rate</p>
                <p className="text-xl font-bold">{totalStats.sent ? Math.round((totalStats.opens / totalStats.sent) * 100) : 0}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-cyan-100 rounded-lg">
                <Send className="h-5 w-5 text-cyan-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Click Rate</p>
                <p className="text-xl font-bold">{totalStats.sent ? Math.round((totalStats.clicks / totalStats.sent) * 100) : 0}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-pink-100 rounded-lg">
                <Zap className="h-5 w-5 text-pink-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Conversions</p>
                <p className="text-xl font-bold">{totalStats.conversions}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="campaigns" className="space-y-6">
        <TabsList>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="workflows">Workflows</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="audience">Audience</TabsTrigger>
        </TabsList>

        <TabsContent value="campaigns" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="relative w-[300px]">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search campaigns..." className="pl-8" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
            <Dialog open={isCreateCampaignOpen} onOpenChange={setIsCreateCampaignOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" /> Create Campaign
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create Email Campaign</DialogTitle>
                  <DialogDescription>Design and schedule an email campaign</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label>Campaign Name</Label>
                    <Input placeholder="e.g., March Newsletter" />
                  </div>
                  <div className="grid gap-2">
                    <Label>Subject Line</Label>
                    <Input placeholder="e.g., Your Monthly Trade Update" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label>Audience</Label>
                      <Select>
                        <SelectTrigger><SelectValue placeholder="Select audience" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all_members">All Members</SelectItem>
                          <SelectItem value="free_members">Free Members</SelectItem>
                          <SelectItem value="paid_members">Paid Members</SelectItem>
                          <SelectItem value="verified_businesses">Verified Businesses</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label>Schedule</Label>
                      <Select>
                        <SelectTrigger><SelectValue placeholder="Select schedule" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="now">Send Now</SelectItem>
                          <SelectItem value="scheduled">Schedule for Later</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label>Email Template</Label>
                    <Select>
                      <SelectTrigger><SelectValue placeholder="Select template" /></SelectTrigger>
                      <SelectContent>
                        {emailTemplates.map(t => (
                          <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateCampaignOpen(false)}>Cancel</Button>
                  <Button onClick={() => { setIsCreateCampaignOpen(false); }}>Create Campaign</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Campaign</TableHead>
                    <TableHead>Audience</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Recipients</TableHead>
                    <TableHead>Opens</TableHead>
                    <TableHead>Clicks</TableHead>
                    <TableHead>Conv.</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCampaigns.map((campaign) => (
                    <TableRow key={campaign.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{campaign.name}</p>
                          <p className="text-xs text-muted-foreground">{campaign.subject}</p>
                        </div>
                      </TableCell>
                      <TableCell><Badge variant="outline">{getAudienceLabel(campaign.audience)}</Badge></TableCell>
                      <TableCell>{getStatusBadge(campaign.status)}</TableCell>
                      <TableCell>{campaign.recipients.toLocaleString()}</TableCell>
                      <TableCell>
                        <div>
                          <p>{campaign.opens.toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground">{campaign.recipients ? Math.round((campaign.opens / campaign.recipients) * 100) : 0}%</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p>{campaign.clicks.toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground">{campaign.recipients ? Math.round((campaign.clicks / campaign.recipients) * 100) : 0}%</p>
                        </div>
                      </TableCell>
                      <TableCell>{campaign.conversions}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon"><Edit className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon"><Copy className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Campaign Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={campaignMetrics}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="sent" stroke="#3b82f6" name="Sent" />
                  <Line type="monotone" dataKey="opened" stroke="#22c55e" name="Opened" />
                  <Line type="monotone" dataKey="clicked" stroke="#f59e0b" name="Clicked" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="workflows" className="space-y-4">
          <div className="flex items-center justify-between">
            <CardDescription>Automated workflows triggered by member actions</CardDescription>
            <Button className="gap-2" onClick={() => setIsCreateWorkflowOpen(true)}>
              <Plus className="h-4 w-4" /> Create Workflow
            </Button>
          </div>

          <div className="grid gap-4">
            {workflows.map((workflow) => (
              <Card key={workflow.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${workflow.isActive ? 'bg-green-100' : 'bg-gray-100'}`}>
                        <Zap className={`h-5 w-5 ${workflow.isActive ? 'text-green-600' : 'text-gray-600'}`} />
                      </div>
                      <div>
                        <h4 className="font-medium">{workflow.name}</h4>
                        <p className="text-sm text-muted-foreground">Trigger: {getTriggerLabel(workflow.trigger)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={workflow.isActive ? 'default' : 'secondary'}>
                        {workflow.isActive ? 'Active' : 'Paused'}
                      </Badge>
                      <Button variant="ghost" size="icon">
                        {workflow.isActive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      </Button>
                      <Button variant="ghost" size="icon"><Edit className="h-4 w-4" /></Button>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-2">
                    <p className="text-xs text-muted-foreground">Steps:</p>
                    {workflow.steps.map((step, i) => (
                      <div key={step.id} className="flex items-center">
                        <Badge variant="outline" className="text-xs capitalize">
                          {step.type}
                        </Badge>
                        {i < workflow.steps.length - 1 && <span className="mx-1 text-muted-foreground">→</span>}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {emailTemplates.map((template) => (
              <Card key={template.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="text-base">{template.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-2">{template.subject}</p>
                  <p className="text-xs text-muted-foreground line-clamp-3">{template.body}</p>
                  <div className="mt-3 flex flex-wrap gap-1">
                    {template.variables.map(v => (
                      <Badge key={v} variant="outline" className="text-xs">{`{{${v}}}`}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="audience" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Audience Segments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { label: 'All Members', count: audienceStats.totalMembers, color: 'bg-blue-500' },
                    { label: 'Active Members', count: audienceStats.activeMembers, color: 'bg-green-500' },
                    { label: 'Free Members', count: audienceStats.freeMembers, color: 'bg-gray-500' },
                    { label: 'Paid Members', count: audienceStats.paidMembers, color: 'bg-purple-500' },
                    { label: 'Verified Businesses', count: audienceStats.verifiedMembers, color: 'bg-cyan-500' },
                    { label: 'Inactive 30+ Days', count: audienceStats.inactiveMembers, color: 'bg-red-500' },
                  ].map((segment) => (
                    <div key={segment.label} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${segment.color}`} />
                        <span className="text-sm">{segment.label}</span>
                      </div>
                      <span className="font-medium">{segment.count.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
      </div>
    </AdminLayout>
  );
}
