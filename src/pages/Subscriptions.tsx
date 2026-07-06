import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Loader2, Plus, Search, MoreHorizontal, Trash2, PauseCircle, PlayCircle, Edit, ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';

import DashboardSidebar from '@/components/dashboard/Sidebar';
import { AddSubscriptionForm } from '@/components/dashboard/AddSubscriptionForm';
import BrandLogo from '@/components/dashboard/BrandLogo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';

import { useSubscriptions } from '@/hooks/useSubscriptions';
import { Subscription } from '@/lib/mock-data';


const SubscriptionsPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'merchant' | 'amount' | 'nextBillingDate' | 'status'>('amount');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const { data: subscriptions = [], isLoading, refetch } = useSubscriptions();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Always fetch fresh data every time this page is visited
  useEffect(() => {
    refetch();
  }, []);

  const handleSort = (column: 'merchant' | 'amount' | 'nextBillingDate' | 'status') => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc'); // Default to desc when switching to a new column
    }
  };

  const filteredSubscriptions = subscriptions
    .filter((sub) => sub.merchant.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      const modifier = sortOrder === 'asc' ? 1 : -1;
      
      switch (sortBy) {
        case 'amount':
          return (a.amount - b.amount) * modifier;
        case 'nextBillingDate':
          return (new Date(a.nextBillingDate).getTime() - new Date(b.nextBillingDate).getTime()) * modifier;
        case 'merchant':
          return a.merchant.localeCompare(b.merchant) * modifier;
        case 'status':
          return a.status.localeCompare(b.status) * modifier;
        default:
          return 0;
      }
    });

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/subscriptions/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) throw new Error();
      toast.success('Subscription deleted');
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
    } catch (error) {
      toast.error('Failed to delete subscription');
    }
  };

  const handleToggleStatus = async (sub: Subscription) => {
    try {
      const newStatus = sub.status === 'active' ? 'paused' : 'active';
      const res = await fetch(`/api/subscriptions/${sub.id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error();
      toast.success(`Subscription ${newStatus}`);
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar />

      <main className="ml-64 p-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-end mb-8"
        >
          <div>
            <h1 className="font-display text-3xl font-bold mb-2">Subscriptions</h1>
            <p className="text-muted-foreground">Manage all your active and paused subscriptions.</p>
          </div>
          <AddSubscriptionForm>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Subscription
            </Button>
          </AddSubscriptionForm>
        </motion.div>

        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="glass-card p-6"
          >
            {/* Search and Filters */}
            <div className="flex items-center gap-4 mb-6">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search subscriptions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 bg-secondary/50 border-border/50"
                />
              </div>
            </div>

            {/* Data Table */}
            <div className="rounded-md border border-border/50">
              <Table>
                <TableHeader className="bg-secondary/20">
                  <TableRow>
                    <TableHead 
                      className="cursor-pointer hover:bg-secondary/40 transition-colors"
                      onClick={() => handleSort('merchant')}
                    >
                      <div className="flex items-center gap-1">
                        Service
                        {sortBy === 'merchant' ? (sortOrder === 'desc' ? <ArrowDown className="w-3 h-3"/> : <ArrowUp className="w-3 h-3"/>) : <ArrowUpDown className="w-3 h-3 opacity-30"/>}
                      </div>
                    </TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-secondary/40 transition-colors"
                      onClick={() => handleSort('status')}
                    >
                      <div className="flex items-center gap-1">
                        Status
                        {sortBy === 'status' ? (sortOrder === 'desc' ? <ArrowDown className="w-3 h-3"/> : <ArrowUp className="w-3 h-3"/>) : <ArrowUpDown className="w-3 h-3 opacity-30"/>}
                      </div>
                    </TableHead>
                    <TableHead>Billing Cycle</TableHead>
                    <TableHead 
                      className="text-right cursor-pointer hover:bg-secondary/40 transition-colors"
                      onClick={() => handleSort('amount')}
                    >
                      <div className="flex items-center justify-end gap-1">
                        Price
                        {sortBy === 'amount' ? (sortOrder === 'desc' ? <ArrowDown className="w-3 h-3"/> : <ArrowUp className="w-3 h-3"/>) : <ArrowUpDown className="w-3 h-3 opacity-30"/>}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="text-right cursor-pointer hover:bg-secondary/40 transition-colors"
                      onClick={() => handleSort('nextBillingDate')}
                    >
                      <div className="flex items-center justify-end gap-1">
                        Next Billing
                        {sortBy === 'nextBillingDate' ? (sortOrder === 'desc' ? <ArrowDown className="w-3 h-3"/> : <ArrowUp className="w-3 h-3"/>) : <ArrowUpDown className="w-3 h-3 opacity-30"/>}
                      </div>
                    </TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSubscriptions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center">
                        No subscriptions found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredSubscriptions.map((sub) => (
                      <TableRow
                        key={sub.id}
                        onClick={() => navigate(`/dashboard/subscriptions/${sub.id}`)}
                        className="cursor-pointer hover:bg-secondary/30 transition-colors"
                      >
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-3">
                            <BrandLogo logo={sub.logo} color={sub.color} size="sm" />
                            {sub.merchant}
                          </div>
                        </TableCell>
                        <TableCell>{sub.category}</TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              sub.status === 'active'
                                ? 'bg-green-500/10 text-green-500 border-green-500/20'
                                : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                            }
                          >
                            {sub.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="capitalize">{sub.frequency}</TableCell>
                        <TableCell className="text-right font-medium">
                          ${sub.amount.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground">
                          {new Date(sub.nextBillingDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleToggleStatus(sub)}>
                                {sub.status === 'active' ? (
                                  <>
                                    <PauseCircle className="mr-2 h-4 w-4" />
                                    <span>Pause</span>
                                  </>
                                ) : (
                                  <>
                                    <PlayCircle className="mr-2 h-4 w-4" />
                                    <span>Resume</span>
                                  </>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuItem disabled>
                                <Edit className="mr-2 h-4 w-4" />
                                <span>Edit (Coming Soon)</span>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleDelete(sub.id)}
                                className="text-destructive focus:text-destructive"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                <span>Delete</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
};

export default SubscriptionsPage;
