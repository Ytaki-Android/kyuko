import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import type React from "react";
import { useEffect, useState } from "react";
import { Button, ScrollView, StyleSheet, Text, View } from "react-native";

const STORAGE_KEY = "@myapp_data"; // AsyncStorageのキー

const Root: React.FC = () => {
  // 通知のトリガーが発生した際に呼び出されるリスナー
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });
  // データとローディング状態を管理
  const [data, setData] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [notification, setNotification] = useState<boolean>(false);

  const registerForPushNotificationsAsync = async () => {
    if (Device.isDevice) {
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== "granted") {
        alert("Failed to get push token for push notification!");
        return;
      }
      const token = (await Notifications.getExpoPushTokenAsync()).data;
      setExpoPushToken(token);
      console.log(token);
    } else {
      alert("Must use physical device for Push Notifications");
    }
  };
  const scheduleNotification = async () => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "新しい休講情報があります",
        data: { data: "データの例" },
      },
      trigger: { seconds: 2 }, // 2秒後に通知
    });
  };
  // APIからデータを取得する関数
  const fetchData = async () => {
    try {
      const response = await axios.get(
        "https://fastapi-production-8972.up.railway.app/scrape",
      ); // ここにAPIのURLを入れる
      setData(response.data.result); // response.dataに取得したデータが格納される
      console.log(response.data.result);
      const storedData = await AsyncStorage.getItem(STORAGE_KEY);
      if (storedData !== response.data.result) {
        scheduleNotification();
      }

      await AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(response.data.result),
      ); // データをAsyncStorageに保存
      setLoading(false); // データ取得が終わったらローディングを解除
    } catch (error) {
      console.error("Error fetching data:", error);
      setLoading(false); // エラーが発生した場合もローディングを解除
    }
  };

  // コンポーネントがマウントされたときにAPIを呼び出す
  useEffect(() => {
    registerForPushNotificationsAsync();
    fetchData();
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>休講情報一覧</Text>
      {loading ? (
        <Text style={styles.loadingText}>Loading...</Text> // ローディング中の表示
      ) : (
        data.map((item, index) => (
          <Text key={index} style={styles.itemText}>
            {item}
          </Text>
        ))
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  info_item: {
    marginBottom: 10,
  },
  container: {
    padding: 20,
  },
  title: {
    textAlign: "center",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  loadingText: {
    fontSize: 18,
    color: "gray",
  },
  itemText: {
    fontSize: 16,
    marginBottom: 8,
    backgroundColor: "lightblue", // 背景色を水色に設定
    padding: 10, // 少し余白を追加して、見やすくする
    borderRadius: 5, // 角を少し丸くする
  },
});

export default Root;
