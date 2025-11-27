import { Tabs } from "expo-router";
import FontAwesome from '@expo/vector-icons/FontAwesome';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';

const DashboardLayout = () => {
    return (
        <Tabs>
            <Tabs.Screen name="index" options={{title: "Map", tabBarIcon: ({size, color}) => <FontAwesome name="map-marker" size={size} color={color} />}}/>
            <Tabs.Screen name="create" options={{title: "Add", tabBarIcon: ({size, color}) => <FontAwesome6 name="landmark" size={size} color={color} />}}/>
        </Tabs>
    )
}

export default DashboardLayout;