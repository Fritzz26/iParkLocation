import React from "react";
import { View, Text, StyleSheet, Button, Linking } from "react-native";

const LocationDetailsScreen = ({ route }) => {
  const { location } = route.params;

  const openInGoogleMaps = () => {
    const url = `https://www.google.com/maps/search/?api=1&query=${location.latitude},${location.longitude}`;
    Linking.openURL(url);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{location.name}</Text>
      <Text>{location.address}</Text>
      <Text>Lat: {location.latitude}</Text>
      <Text>Lng: {location.longitude}</Text>

      <Button title="Open in Google Maps" onPress={openInGoogleMaps} />
    </View>
  );
};

export default LocationDetailsScreen;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 10 },
});
