import React, { useEffect, useState } from 'react';
import { Button, View, StyleSheet, Text } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';

const Root = () => {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [notification, setNotification] = useState<boolean>(false);

  // 通知のトリガーが発生した際に呼び出されるリスナー
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });

  // 通知の許可をリクエスト
  const registerForPushNotificationsAsync = async () => {
    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        alert('Failed to get push token for push notification!');
        return;
      }
      const token = (await Notifications.getExpoPushTokenAsync()).data;
      setExpoPushToken(token);
      console.log(token);
    } else {
      alert('Must use physical device for Push Notifications');
    }
  };

  // ローカル通知をスケジュール
  const scheduleNotification = async () => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "新しい休講情報があります",
        data: { data: 'データの例' },
      },
      trigger: { seconds: 2 }, // 2秒後に通知
    });
  };

  useEffect(() => {
    registerForPushNotificationsAsync();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Expo Go ローカル通知</Text>
      <Button title="2秒後にローカル通知を送る" onPress={scheduleNotification} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
});

export default Root;
