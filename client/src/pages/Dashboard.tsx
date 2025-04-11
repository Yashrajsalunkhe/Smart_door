import { useEffect, useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Home, 
  Camera, 
  Users, 
  Clock, 
  Settings,
  Lock, 
  Eye, 
  Battery, 
  User 
} from "lucide-react";

// Import types for our API responses
interface HistoryEntry {
  id: number;
  personName: string;
  isKnown: boolean;
  confidence: number;
  timestamp: Date;
  doorStatus: string;
  snapshot: string;
}

interface DoorStatusResponse {
  id: number;
  status: string;
  lastUpdated: string;
}

interface TodaySummary {
  total: number;
  known: number;
  unknown: number;
}

export default function Dashboard() {
  const [lastSnapshot, setLastSnapshot] = useState<string | null>(null);

  // Fetch the last history entry for the snapshot
  const { data: lastHistoryEntry, isLoading: historyLoading } = useQuery({
    queryKey: ['/api/history/latest'],
    staleTime: 5000 // Refresh every 5 seconds
  });

  // Fetch door status
  const { data: doorStatus, isLoading: doorLoading } = useQuery({
    queryKey: ['/api/door/status'],
    staleTime: 5000
  });

  // Fetch today's activity
  const { data: todayActivity, isLoading: activityLoading } = useQuery({
    queryKey: ['/api/history/today/summary']
  });

  useEffect(() => {
    if (lastHistoryEntry && lastHistoryEntry.snapshot) {
      setLastSnapshot(lastHistoryEntry.snapshot);
    }
  }, [lastHistoryEntry]);

  const quickNavCards = [
    {
      title: "Face Recognition",
      description: "Monitor doorbell camera and identify visitors in real-time.",
      icon: <Camera className="h-6 w-6 text-primary dark:text-primary-400" />,
      href: "/face-recognition"
    },
    {
      title: "Face Management",
      description: "Add, edit or remove recognized faces from your database.",
      icon: <Users className="h-6 w-6 text-primary dark:text-primary-400" />,
      href: "/face-management"
    },
    {
      title: "Visit History",
      description: "Browse through past visitors and doorbell activity.",
      icon: <Clock className="h-6 w-6 text-primary dark:text-primary-400" />,
      href: "/history"
    },
    {
      title: "Settings",
      description: "Customize your doorbell system preferences and notifications.",
      icon: <Settings className="h-6 w-6 text-primary dark:text-primary-400" />,
      href: "/settings"
    }
  ];

  return (
    <div className="p-4 md:p-8 fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold mb-2">Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400">Welcome to your Smart Doorbell System</p>
      </div>
      
      {/* Status Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Door Status Card */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-medium text-gray-600 dark:text-gray-400">Door Status</h2>
              <div className="flex items-center space-x-1">
                <span className={`h-3 w-3 ${doorStatus?.status === 'locked' ? 'bg-green-500' : 'bg-yellow-500'} rounded-full`}></span>
                <span className={`text-xs ${doorStatus?.status === 'locked' ? 'text-green-500' : 'text-yellow-500'} font-medium`}>
                  {doorStatus?.status === 'locked' ? 'Secure' : 'Unlocked'}
                </span>
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <Lock className="h-8 w-8 text-primary mr-3" />
              <div>
                <p className="text-lg font-semibold">{doorLoading ? 'Loading...' : (doorStatus?.status === 'locked' ? 'Locked' : 'Unlocked')}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Updated {doorLoading ? '...' : doorStatus?.lastUpdated}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Last Visitor Card */}
        <Card>
          <CardContent className="p-4">
            <h2 className="text-sm font-medium text-gray-600 dark:text-gray-400">Last Visitor</h2>
            <div className="mt-4 flex items-center">
              <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 mr-3">
                <User className="h-6 w-6" />
              </div>
              <div>
                <p className="text-lg font-semibold">
                  {historyLoading ? 'Loading...' : (lastHistoryEntry?.personName || 'No visitors yet')}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {historyLoading ? '...' : (lastHistoryEntry?.timestamp ? new Date(lastHistoryEntry.timestamp).toLocaleString() : 'N/A')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Detection Card */}
        <Card>
          <CardContent className="p-4">
            <h2 className="text-sm font-medium text-gray-600 dark:text-gray-400">Today's Activity</h2>
            <div className="mt-4">
              <div className="flex items-center">
                <Eye className="h-8 w-8 text-primary mr-3" />
                <div>
                  <p className="text-lg font-semibold">
                    {activityLoading ? 'Loading...' : `${todayActivity?.total || 0} Visitors`}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {activityLoading ? '...' : `${todayActivity?.known || 0} Known, ${todayActivity?.unknown || 0} Unknown`}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Battery Card */}
        <Card>
          <CardContent className="p-4">
            <h2 className="text-sm font-medium text-gray-600 dark:text-gray-400">System Status</h2>
            <div className="mt-4 flex items-center">
              <Battery className="h-8 w-8 text-green-500 mr-3" />
              <div>
                <p className="text-lg font-semibold">Online</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">All systems operational</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Last Snapshot */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium">Last Snapshot</h2>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {historyLoading ? 'Loading...' : (lastHistoryEntry?.timestamp ? new Date(lastHistoryEntry.timestamp).toLocaleString() : 'No snapshots yet')}
            </span>
          </div>
          
          <div className="rounded-md overflow-hidden relative" style={{ height: '300px', width: '100%' }}>
            {lastSnapshot ? (
              <img 
                src={lastSnapshot} 
                alt="Last doorbell snapshot" 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-700 text-gray-500">
                No snapshots available
              </div>
            )}
            
            {/* Face Detection Overlay - would be dynamically positioned in a real app */}
            {lastHistoryEntry?.isKnown && (
              <>
                <div className="face-box" style={{ top: '120px', left: '320px', width: '100px', height: '100px' }}></div>
                <div className="face-label" style={{ top: '110px', left: '320px' }}>{lastHistoryEntry.personName}</div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickNavCards.map((card, index) => (
          <Link key={index} href={card.href}>
            <div className="block bg-white dark:bg-gray-800 rounded-lg shadow-md p-5 hover:bg-gray-50 dark:hover:bg-gray-700 transition duration-150 cursor-pointer">
              <div className="flex items-center mb-3">
                <div className="p-2 bg-primary-100 dark:bg-primary-900 rounded-md">
                  {card.icon}
                </div>
                <h3 className="ml-3 text-md font-medium">{card.title}</h3>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">{card.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
