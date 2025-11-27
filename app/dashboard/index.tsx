import React from "react";
import { ActivityIndicator, View,  } from "react-native";
import { Button } from "@/components/ui/button"
import { Text } from "@/components/ui/text";

import MapView, {Marker} from "react-native-maps";
import { useSupabase } from "@/context/SupabaseContext";

const MapScreen = () => {
    const { logout, landmarks, loading, error } = useSupabase();

    if (loading) {
        return <ActivityIndicator animating={true}/>
    }
    if (error) {
        return (
            <View>
                <Text>{error.message}</Text>
            </View>
        )
    }

    console.log(landmarks);

    return (
        <View style={{flex: 1}}>
            <Button onPress={() => { logout() }}><Text>Logout</Text></Button>
            <MapView
                style={{ flex: 1 }}
            >
                {
                    landmarks.map(landmark => (
                        <Marker key={landmark.id} title={landmark.label} coordinate={{
                            latitude: landmark.latitude,
                            longitude: landmark.longitude
                        }}/>
                    ))
                }
                

            </MapView>
        </View>
    )
}

export default MapScreen;