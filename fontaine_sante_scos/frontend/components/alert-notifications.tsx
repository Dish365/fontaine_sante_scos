"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAlerts,
  markAlertAsRead,
  markAllAlertsAsRead,
  resolveAlert,
  deleteAlert,
  Alert,
} from "@/store/slices/alertSlice";
import { RootState } from "@/store";
import {
  Bell,
  Check,
  X,
  AlertTriangle,
  Info,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import {
  Button,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Badge,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui";

export function AlertNotifications() {
  const dispatch = useDispatch();
  const { alerts, unreadCount, loading } = useSelector(
    (state: RootState) => state.alert
  );
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchAlerts() as any);
  }, [dispatch]);

  const handleMarkAsRead = (id: string) => {
    dispatch(markAlertAsRead(id) as any);
  };

  const handleMarkAllAsRead = () => {
    dispatch(markAllAlertsAsRead() as any);
    setIsOpen(false);
  };

  const handleResolveAlert = (id: string) => {
    dispatch(resolveAlert(id) as any);
  };

  const handleDeleteAlert = (id: string) => {
    dispatch(deleteAlert(id) as any);
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case "error":
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "info":
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "low":
      default:
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <h4 className="font-semibold">Notifications</h4>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllAsRead}
              disabled={loading}
            >
              Mark all as read
            </Button>
          )}
        </div>
        <div className="max-h-96 overflow-y-auto">
          {alerts.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              No notifications
            </div>
          ) : (
            alerts.map((alert: Alert) => (
              <Card
                key={alert.id}
                className={`m-2 border ${!alert.isRead ? "bg-muted/50" : ""}`}
              >
                <CardHeader className="p-3 pb-0 flex flex-row items-start justify-between space-y-0">
                  <div className="flex items-center gap-2">
                    {getAlertIcon(alert.type)}
                    <CardTitle className="text-sm font-medium">
                      {alert.title}
                    </CardTitle>
                  </div>
                  <div className="flex gap-1">
                    {!alert.isRead && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => handleMarkAsRead(alert.id)}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => handleDeleteAlert(alert.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-3 pt-1">
                  <p className="text-xs text-muted-foreground">
                    {alert.description}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge
                      className={`text-xs ${getSeverityColor(alert.severity)}`}
                    >
                      {alert.severity}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(alert.createdAt).toLocaleString()}
                    </span>
                  </div>
                </CardContent>
                {!alert.isResolved && (
                  <CardFooter className="p-2 pt-0 flex justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs h-7"
                      onClick={() => handleResolveAlert(alert.id)}
                    >
                      Resolve
                    </Button>
                  </CardFooter>
                )}
              </Card>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
