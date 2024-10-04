    import React, { useEffect, useState, useRef  } from "react";
    import { Button, Platform, Text, View } from "react-native";
    import * as Notifications from "expo-notifications";
    import * as Device from "expo-device";

    // 通知ハンドラーの設定
    Notifications.setNotificationHandler({
        handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: false, // 音を鳴らさない設定
        shouldSetBadge: false,
        }),
    });

    const Root = () => {
    // プッシュトークンの状態
    const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
    
    // 受け取った通知
    const [notification, setNotification] = useState<Notifications.Notification | null>(null);

    // リスナーのリファレンス
    const notificationListener = useRef<Notifications.Subscription | null>(null);
    const responseListener = useRef<Notifications.Subscription | null>(null);

    // プッシュ通知に登録する関数
    const registerForPushNofications = async (): Promise<void> => {
        try {
        // アプリを実行しているデバイスはモバイルかどうかを確認する
        if (!Device.isDevice) {
            alert("このアプリはモバイルデバイスのみで実行できます");
            return;
        }

        // アプリが通知を受ける許可があるかどうかを確認する
        const { status: existingStatus } =
            await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        // まだ許可されていない場合には、許可を求める
        if (existingStatus !== "granted") {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }

        // 許可が否定されたら、ユーザに知らせる
        if (finalStatus !== "granted") {
            alert("プッシュ通知のトークンの取得ができませんでした。");
            return;
        }

        // トークンを取得して、スマホの画面で表示する
        const token = (await Notifications.getExpoPushTokenAsync()).data;
        console.log("token", token);
        setExpoPushToken(token);

        // アンドロイドなら、通知のオプションを変更できる
        if (Platform.OS === "android") {
            Notifications.setNotificationChannelAsync("default", {
            name: "default",
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: "#FF231F7C",
            });
        }
        } catch (err) {
        alert("エラーが発生しました: " + err);
        }
    };

    // 通知のスケジュールを行う関数
    const schedulePushNotification = async (): Promise<void> => {
        await Notifications.scheduleNotificationAsync({
        content: {
            title: "通知のタイトル! 📬",
            body: "通知の内容",
            data: { data: "通知のデータ" },
        },
        // 通知が送信されるまでの時間（秒）
        trigger: { seconds: 2 },
        });
    };

    useEffect(() => {
        registerForPushNofications();

        // 通知を受け取った時のリスナー
        notificationListener.current = Notifications.addNotificationReceivedListener((notification) => {
        setNotification(notification);
        });

        // 通知をタップした時のリスナー（アプリがバックグラウンドの時）
        responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
        setNotification(response.notification);
        console.log(response.notification);
        });

        // クリーンアップ処理
        return () => {
        if (notificationListener.current) {
            Notifications.removeNotificationSubscription(notificationListener.current);
        }
        if (responseListener.current) {
            Notifications.removeNotificationSubscription(responseListener.current);
        }
        };
    }, []);

    return (
        <View
        style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "space-around",
        }}
        >
        <Text>あなたのExpoプッシュトークン: {expoPushToken ?? "取得中..."}</Text>

        {/* 通知のタイトル、内容とデータを表示する */}
        <View style={{ alignItems: "center", justifyContent: "center" }}>
            <Text>タイトル: {notification?.request.content.title ?? "なし"}</Text>
            <Text>内容: {notification?.request.content.body ?? "なし"}</Text>
            <Text>
            データ: {notification ? JSON.stringify(notification.request.content.data) : "なし"}
            </Text>
        </View>
        <Button
        title="通知を送信する"
        onPress={async () => {
            await schedulePushNotification();
        }}
        />
        </View>
    );
    }

    export default Root;
