import { Tabs } from "expo-router";
import FontAwesome from '@expo/vector-icons/FontAwesome';

const DashboardLayout = () => {
    return (
        <Tabs
            screenOptions={{
                tabBarShowLabel: false,
                tabBarStyle: { height: 58, paddingBottom: 6, paddingTop: 6 },
            }}>
            <Tabs.Screen name="index" options={{ tabBarIcon: ({size, color}) => <FontAwesome name="home" size={size} color={color} />}}/>
            <Tabs.Screen name="search" options={{ tabBarIcon: ({size, color}) => <FontAwesome name="search" size={size} color={color} />}}/>
            <Tabs.Screen name="profile" options={{ tabBarIcon: ({size, color}) => <FontAwesome name="user" size={size} color={color} />}}/>
            <Tabs.Screen name="create" options={{ href: null }} />
            <Tabs.Screen name="user/[handle]" options={{ href: null }} />
        </Tabs>
    )
}

export default DashboardLayout;
