import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { View } from "react-native";
import { Text } from "@/components/ui/text";
import { useState } from "react";
import { useSupabase } from "@/context/SupabaseContext";

const CreateLandmarkScreen = () => {
    const { addLandmark } = useSupabase();

    const [label, setLabel] = useState("");
    const [latitude, setLatitude] = useState<string>("");
    const [longitude, setLongitude] = useState<string>("");

    const add = async() => {

        const latitudeParsed = parseFloat(latitude.replace(",", "."));
        const longitudeParsed = parseFloat(longitude.replace(",", "."));

        if (isNaN(latitudeParsed)) {
            alert("Latitude should be a number");
            return;
        }
        if (isNaN(longitudeParsed)) {
            alert("Longitude should be a number");
            return;
        }

        // Extra validatie komt hier...


        try {
            await addLandmark({label, latitude: latitudeParsed, longitude: longitudeParsed})
            alert("Landmark added");
        } catch (e : any) {
            console.log(e);
            alert(e.message);
        }
    }

    return (
        <View className="flex items-center p-4">
            <Card className="w-full max-w-sm">
                <CardHeader className="flex-row">
                    <View className="flex-1 gap-1.5">
                        <CardTitle>Add new landmark</CardTitle>
                        <CardDescription>Fill in the details below to add a new landmark. </CardDescription>
                    </View>
                </CardHeader>
                <CardContent>
                    <View className="w-full justify-center gap-4">
                        <View className="gap-2">
                            <Label htmlFor="label">Label</Label>
                            <Input value={label} onChangeText={(l) => setLabel(l)} id="label" placeholder="Landmark label" />
                        </View>
                        <View className="gap-2">
                            <Label htmlFor="latitude">Latitude</Label>
                            <Input value={latitude} onChangeText={(l) => setLatitude(l)} inputMode="decimal" id="latitude" placeholder="51.3344" />
                        </View>
                        <View className="gap-2">
                            <Label htmlFor="longitude">Longitude</Label>
                            <Input value={longitude} onChangeText={(l) => setLongitude(l)} inputMode="decimal" id="longitude" placeholder="4.2222" />
                        </View>
                    </View>
                </CardContent>
                <CardFooter className="flex-col gap-2">
                    <Button className="w-full" onPress={add}>
                        <Text>Add</Text>
                    </Button>

                </CardFooter>
            </Card>
        </View>
    )
}

export default CreateLandmarkScreen;