import { View, Text } from "react-native";
import { StatusBar } from "expo-status-bar";

export default function Home() {
    return (
        <View className="flex-1 items-center justify-center bg-white">
            <StatusBar style="auto" />
            <Text className="text-2xl font-bold text-gray-800">Music Player</Text>
            <Text className="text-gray-500 mt-2">Ready to rock!</Text>
        </View>
    );
}
