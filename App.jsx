import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import MapScreen from "./screens/MapScreen";
import LocationDetailsScreen from "./screens/LocationDetailsScreen";

const Stack = createNativeStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Map" component={MapScreen} />
        <Stack.Screen name="Details" component={LocationDetailsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
