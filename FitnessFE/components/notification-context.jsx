import React, { createContext, useContext, useEffect } from 'react';
import * as Notifications from 'expo-notifications';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const scheduleCurrentExerciseNotification = async (exercise) => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: `Current Exercise: ${exercise.name}`,
        body: `Time to focus on ${exercise.name}! Duration: ${exercise.duration}`,
        data: { exercise },
      },
      trigger: { seconds: 1 },
    });
  };

  const scheduleNextExerciseNotification = async (exercise, delay) => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Ready for the Next Exercise?",
        body: `Move on to ${exercise.name} when you're ready.`,
        data: { exercise },
      },
      trigger: { seconds: delay },
    });
  };

  const cancelAllNotifications = async () => {
    await Notifications.cancelAllScheduledNotificationsAsync();
  };

  return (
    <NotificationContext.Provider
      value={{
        scheduleCurrentExerciseNotification,
        scheduleNextExerciseNotification,
        cancelAllNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => useContext(NotificationContext);
