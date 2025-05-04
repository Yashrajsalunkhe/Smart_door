import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { SearchIcon, User, Shield, Bell, MoreVertical, Trash2, Trash } from "lucide-react";

// Add type for history entry
interface HistoryEntry {
  id: number;
  personName: string;
  isKnown: boolean;
  snapshot?: string;
  timestamp: string;
  doorStatus: string;
}

interface HistoryResponse {
  entries: HistoryEntry[];
  total: number;
}

export default function History() {
  const [searchQuery, setSearchQuery] = useState("");
  const [visitorFilter, setVisitorFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showDeleteAll, setShowDeleteAll] = useState(false);

  const queryClient = useQueryClient();

  // Fetch history entries with pagination
  const { data, isLoading } = useQuery<HistoryResponse>({
    queryKey: ['/api/history', visitorFilter, dateFilter, currentPage],
  });
  
  // Filter history entries by name
  const filteredHistory = data?.entries 
    ? data.entries.filter((entry: any) => 
        entry.personName.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];
  
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };
  
  // Mutation for deleting a history entry
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/history/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete history entry");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/history"] });
      setDeletingId(null);
      setShowConfirm(false);
    },
  });

  // Mutation for deleting all history entries
  const deleteAllMutation = useMutation({
    mutationFn: async () => {
      if (!data?.entries) return;
      // Delete all entries in parallel
      await Promise.all(
        data.entries.map((entry) =>
          fetch(`/api/history/${entry.id}`, { method: "DELETE" })
        )
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/history"] });
      setShowDeleteAll(false);
    },
  });

  // Use mutation status for loading
  const isDeleting = deleteMutation.status === "pending";
  const isDeletingAll = deleteAllMutation.status === "pending";

  return (
    <div className="p-4 md:p-8 fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold mb-2">Visit History</h1>
        <p className="text-gray-600 dark:text-gray-400">Browse through past visitors and doorbell activity</p>
      </div>
      
      {/* History Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search by name"
                  className="w-full pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <SearchIcon className="h-5 w-5 absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2 items-center">
              <Select
                value={visitorFilter}
                onValueChange={setVisitorFilter}
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Filter visitors" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All visitors</SelectItem>
                  <SelectItem value="known">Known visitors</SelectItem>
                  <SelectItem value="unknown">Unknown visitors</SelectItem>
                </SelectContent>
              </Select>
              
              <Input
                type="date"
                className="w-[150px]"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              />
              
              <Button
                variant="destructive"
                size="sm"
                className="ml-2"
                onClick={() => setShowDeleteAll(true)}
                disabled={!data?.entries?.length || isDeletingAll}
                title="Delete all history entries"
              >
                <Trash className="h-4 w-4 mr-1" /> Delete All
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* History Gallery */}
      <Card>
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-medium">Activity Log</h2>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {data?.total || 0} entries
            </span>
          </div>
        </div>
        
        <CardContent className="p-4">
          {isLoading ? (
            <div className="text-center py-8">Loading history...</div>
          ) : filteredHistory.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {searchQuery || dateFilter || visitorFilter !== 'all' ? "No matching history entries found" : "No history entries yet"}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {data?.entries.map((entry: any) => (
                <div key={entry.id} className="border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden shadow-sm">
                  <div className="aspect-w-16 aspect-h-9 bg-gray-200 dark:bg-gray-700 relative">
                    {entry.snapshot ? (
                      <img 
                        src={entry.snapshot} 
                        alt={`${entry.personName} at door`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <User className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                    <div className="absolute top-2 right-2 flex gap-2">
                      <span className={`inline-flex items-center ${
                        entry.isKnown ? 'bg-green-500' : 'bg-red-500'
                      } px-2 py-0.5 rounded text-xs font-medium text-white`}>
                        {entry.isKnown ? 'Known' : 'Unknown'}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-gray-400 hover:text-red-500"
                        title="Delete entry"
                        onClick={() => { setDeletingId(entry.id); setShowConfirm(true); }}
                        disabled={isDeleting && deletingId === entry.id}
                      >
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                  <div className="p-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">{entry.personName}</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {formatDate(entry.timestamp)}
                        </p>
                      </div>
                      <Button variant="ghost" size="icon" className="text-gray-400 hover:text-gray-500">
                        <MoreVertical className="h-5 w-5" />
                      </Button>
                    </div>
                    <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 flex items-center">
                      {entry.doorStatus === 'unlocked' ? (
                        <>
                          <Shield className="h-4 w-4 mr-1 text-green-500" />
                          Door unlocked automatically
                        </>
                      ) : (
                        <>
                          <Bell className="h-4 w-4 mr-1 text-amber-500" />
                          Notification sent
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Delete confirmation dialog */}
          {showConfirm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-xs">
                <h3 className="text-lg font-semibold mb-2">Delete Entry?</h3>
                <p className="text-sm mb-4">Are you sure you want to delete this history entry? This action cannot be undone.</p>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => { setShowConfirm(false); setDeletingId(null); }} disabled={isDeleting}>
                    Cancel
                  </Button>
                  <Button variant="destructive" onClick={() => deletingId && deleteMutation.mutate(deletingId)} disabled={isDeleting}>
                    {isDeleting ? "Deleting..." : "Delete"}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Delete All confirmation dialog */}
          {showDeleteAll && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-xs">
                <h3 className="text-lg font-semibold mb-2">Delete All Snapshots?</h3>
                <p className="text-sm mb-4">Are you sure you want to delete <b>all</b> history entries? This action cannot be undone.</p>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowDeleteAll(false)} disabled={isDeletingAll}>
                    Cancel
                  </Button>
                  <Button variant="destructive" onClick={() => deleteAllMutation.mutate()} disabled={isDeletingAll}>
                    {isDeletingAll ? "Deleting..." : "Delete All"}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Pagination */}
          {data && data.total > 0 && (
            <div className="mt-6 flex items-center justify-between">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Showing <span className="font-medium">{(currentPage - 1) * 9 + 1}-{Math.min(currentPage * 9, data.total)}</span> of <span className="font-medium">{data.total}</span> results
              </div>
              <div className="flex space-x-1">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage * 9 >= data.total}
                  onClick={() => setCurrentPage(p => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
