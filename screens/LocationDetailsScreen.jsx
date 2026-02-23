// LocationDetailsModal.jsx
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Linking,
} from "react-native";

const LocationDetailsModal = ({ location }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  if (!location) return null;

  const openInGoogleMaps = () => {
    const url = `https://www.google.com/maps/search/?api=1&query=${location.latitude},${location.longitude}`;
    Linking.openURL(url);
  };

  let imageSource;
  if (location.image) {
    if (typeof location.image === "number") {
      imageSource = location.image;
    } else if (typeof location.image === "string" && location.image.startsWith("http")) {
      imageSource = { uri: location.image };
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

        {/* Borderline below the image */}
        <View style={styles.imageBorderLine} />

        {/* Rent details below the border */}
        {location.rentDetails && (
          <Text style={styles.rentDetails}>{location.rentDetails}</Text>
        )}
      </View>
    </ScrollView>
  );
};

export default LocationDetailsModal;

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 8 },
  address: { color: "#555", marginBottom: 10 },
  parkingType: { color: "#555", marginBottom: 10 },
  openingHours: { color: "green", marginBottom: 10 },
  buttonContainer: { marginTop: 1, alignItems: "center", marginBottom: 15 },
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
  customButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  imageContainer: { position: "relative", marginBottom: 15 },
  loader: { position: "absolute", alignSelf: "center", top: "45%", zIndex: 1 },
  image: { width: "100%", height: 230, borderRadius: 15 },
  imageBorderLine: { borderBottomWidth: 2, borderBottomColor: "#ccc", marginTop: 10 },
  rentDetails: { marginTop: 30, fontSize: 16, color: "#333", lineHeight: 22 },
  errorText: { color: "red", marginTop: 8 },
});