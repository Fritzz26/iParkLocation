import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Button,
  Linking,
  Image,
  ScrollView,
  ActivityIndicator,
} from "react-native";


const LocationDetailsScreen = ({ route }) => {
  const { location } = route.params;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const openInGoogleMaps = () => {
    const url = `https://www.google.com/maps/search/?api=1&query=${location.latitude},${location.longitude}`;
    Linking.openURL(url);
  };

  // Determine image source: local or remote
  let imageSource;
  if (location.image) {
    // If the image is a number, it is a local require
    if (typeof location.image === "number") {
      imageSource = location.image; // local image
    } else if (typeof location.image === "string" && location.image.startsWith("http")) {
      imageSource = { uri: location.image }; // remote image
    } else {
      imageSource = { uri: "https://via.placeholder.com/400x250.png?text=No+Image" };
    }
  } else {
    imageSource = { uri: "https://via.placeholder.com/400x250.png?text=No+Image" };
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.imageContainer}>
        {loading && <ActivityIndicator size="large" style={styles.loader} />}

        <Image
          source={imageSource}
          style={styles.image}
          resizeMode="cover"
          onLoadEnd={() => setLoading(false)}
          onError={() => {
            setLoading(false);
            setError(true);
          }}
        />

        {error && <Text style={styles.errorText}>Image failed to load</Text>}
      </View>

      <Text style={styles.title}>{location.name}</Text>
      <Text style={styles.address}>{location.address}</Text>

      <Text style={styles.coords}>Lat: {location.latitude}</Text>
      <Text style={styles.coords}>Lng: {location.longitude}</Text>

      <View style={styles.buttonContainer}>
        <Button title="Open in Google Maps" onPress={openInGoogleMaps} />
      </View>
    </ScrollView>
  );
};

export default LocationDetailsScreen;

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  imageContainer: {
    position: "relative",
    marginBottom: 15,
  },
  image: {
    width: "100%",
    height: 230,
    borderRadius: 15,
  },
  loader: {
    position: "absolute",
    alignSelf: "center",
    top: "45%",
    zIndex: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 8,
  },
  address: {
    color: "#555",
    marginBottom: 10,
  },
  coords: {
    marginBottom: 4,
  },
  buttonContainer: {
    marginTop: 15,
  },
  errorText: {
    color: "red",
    marginTop: 8,
  },
});
