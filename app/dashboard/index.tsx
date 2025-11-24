import React from "react";
import { View,  } from "react-native";
import { Button } from "@/components/ui/button"
import { Text } from "@/components/ui/text";

import MapView, {Marker} from "react-native-maps";
import { useSupabase } from "@/context/SupabaseContext";

const MapScreen = () => {
    const { logout } = useSupabase();
    return (
        <View style={{flex: 1}}>
            <Button onPress={() => { logout() }}><Text>Logout</Text></Button>
            <MapView
                style={{ flex: 1 }}
            >
                <Marker title="De Zwaan" coordinate={{
                    latitude: 51.2212652,
                    longitude: 4.3996776
                }}>

                </Marker>
                    

            </MapView>
        </View>
    )
}

export default MapScreen;