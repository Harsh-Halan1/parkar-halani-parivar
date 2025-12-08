// File: frontend/src/components/EventNotificationPopup.tsx
// Popup for event-triggered update suggestions

'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, AlertCircle, CheckCircle2 } from 'lucide-react';
import { apiClient } from '@/lib/api';

interface EventNotification {
  eventId: string;
  eventType: 'BIRTH' | 'DEATH' | 'BIRTHDAY' | 'ACHIEVEMENT' | 'GENERAL';
  personId: string;
  personName: string;
  suggestedUpdates: string[];
  message: string;
}

interface EventNotificationPopupProps {
  isOpen: boolean;
  notification: EventNotification | null;
  onClose: () => void;
  onGoToProfile?: (personId: string) => void;
}

export function EventNotificationPopup({
  isOpen,
  notification,
  onClose,
  onGoToProfile,
}: EventNotificationPopupProps) {
  const t = useTranslations();
  const [acknowledged, setAcknowledged] = useState(false);

  const handleAcknowledge = async () => {
    if (!notification) return;

    try {
      // Call backend to log acknowledgment
      await apiClient.post(
        `/events/${notification.eventId}/acknowledge`,
        {}
      );

      setAcknowledged(true);

      // Close after short delay
      setTimeout(() => {
        onClose();
        setAcknowledged(false);
      }, 1500);
    } catch (error) {
      console.error('Failed to acknowledge notification:', error);
      // Still close even if logging fails
      onClose();
    }
  };

  if (!isOpen || !notification) return null;

  // Determine icon based on event type
  const isDeathEvent = notification.eventType === 'DEATH';
  const isBirthEvent = notification.eventType === 'BIRTH';

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md shadow-lg animate-in fade-in zoom-in-95">
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2">
              {isDeathEvent ? (
                <AlertCircle className="w-5 h-5 text-red-500" />
              ) : isBirthEvent ? (
                <AlertCircle className="w-5 h-5 text-blue-500" />
              ) : (
                <AlertCircle className="w-5 h-5 text-amber-500" />
              )}
              {t('events.eventNotification')}
            </CardTitle>
            <CardDescription className="mt-1">
              {notification.personName}
            </CardDescription>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Main message */}
          <p className="text-sm text-foreground">
            {notification.message}
          </p>

          {/* Suggested updates */}
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">{t('events.suggestedUpdates')}</h4>
            <ul className="space-y-2">
              {notification.suggestedUpdates.map((update, index) => (
                <li key={index} className="flex gap-2 text-sm">
                  <span className="text-amber-500 mt-0.5">•</span>
                  <span className="text-muted-foreground">{update}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className="flex-1"
            >
              {t('common.dismiss')}
            </Button>
            {onGoToProfile && (
              <Button
                variant="default"
                size="sm"
                onClick={() => {
                  onGoToProfile(notification.personId);
                  onClose();
                }}
                className="flex-1"
              >
                {t('common.updateProfile')}
              </Button>
            )}
          </div>

          {/* Acknowledgment message */}
          {acknowledged && (
            <div className="flex items-center gap-2 text-sm text-green-600 pt-2 border-t">
              <CheckCircle2 className="w-4 h-4" />
              <span>{t('events.notificationAcknowledged')}</span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Hook to manage event notifications
 */
export function useEventNotifications(familyId: string) {
  const [notifications, setNotifications] = useState<EventNotification[]>([]);
  const [currentNotification, setCurrentNotification] = useState<EventNotification | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  // Fetch pending suggestions when component mounts
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await apiClient.get(
          `/events/suggestions?familyId=${familyId}`
        );
        if (response.data && Array.isArray(response.data)) {
          setNotifications(response.data);
          // Show first notification
          if (response.data.length > 0) {
            setCurrentNotification(response.data[0]);
            setIsOpen(true);
          }
        }
      } catch (error) {
        console.error('Failed to fetch event notifications:', error);
      }
    };

    if (familyId) {
      fetchNotifications();
    }
  }, [familyId]);

  const showNextNotification = () => {
    if (!currentNotification) return;

    const currentIndex = notifications.findIndex(
      (n) => n.eventId === currentNotification.eventId
    );

    if (currentIndex < notifications.length - 1) {
      setCurrentNotification(notifications[currentIndex + 1]);
      setIsOpen(true);
    }
  };

  const dismissNotification = () => {
    setIsOpen(false);
    // Remove from list
    if (currentNotification) {
      const filtered = notifications.filter(
        (n) => n.eventId !== currentNotification.eventId
      );
      setNotifications(filtered);
    }
  };

  return {
    isOpen,
    currentNotification,
    notifications,
    dismissNotification,
    showNextNotification,
    hasMore: notifications.length > 1,
  };
}
