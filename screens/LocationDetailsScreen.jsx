import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Linking,
  Image,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
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
    if (typeof location.image === "number") {
      imageSource = location.image; // local
    } else if (typeof location.image === "string" && location.image.startsWith("http")) {
      imageSource = { uri: location.image }; // remote
    } else {
      imageSource = { uri: "https://via.placeholder.com/400x250.png?text=No+Image" };
    }
  } else {
    imageSource = { uri: "https://via.placeholder.com/400x250.png?text=No+Image" };
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{location.name}</Text>
      <Text style={styles.address}>{location.address}</Text>
      <Text style={styles.parkingType}>{location.parkingType}</Text>
      <Text style={styles.openingHours}>{location.openingHours}</Text>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.customButton} onPress={openInGoogleMaps}>
          <Text style={styles.customButtonText}>Open in Google Maps</Text>
        </TouchableOpacity>
      </View>

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

      {/* -------------------- BORDER LINE -------------------- */}
      <View style={styles.borderLine} />
    </ScrollView>
  );
};

export default LocationDetailsScreen;

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  imageContainer: {
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
  parkingType: {
    color: "#555",
    marginBottom: 10,
  },
  openingHours: {
    color: "green",
    marginBottom: 10,
  },
  buttonContainer: {
    marginTop: 1,
    alignItems: "center",
    marginBottom: 10,
  },
  customButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 25,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  customButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  errorText: {
    color: "red",
    marginTop: 8,
  },
  borderLine: {
    height: 2,
    backgroundColor: "#999",
    marginVertical: 15,
    borderRadius: 1,
  },
});