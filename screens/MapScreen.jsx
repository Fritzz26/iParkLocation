import React, { useEffect, useRef, useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Image,
  PermissionsAndroid,
  Platform,
} from "react-native";
import MapView, { Marker, Callout } from "react-native-maps";
import Geolocation from "@react-native-community/geolocation";
import { locations } from "../data/locations";

const MapScreen = ({ navigation }) => {
  const mapRef = useRef(null);
  const [isCentered, setIsCentered] = useState(false);

  useEffect(() => {
    requestLocationPermission();
  }, []);

  const requestLocationPermission = async () => {
    if (Platform.OS === "android") {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
      );

      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        getCurrentLocation();
      }
    } else {
      getCurrentLocation();
    }
  };

  const getCurrentLocation = () => {
    Geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const region = {
          latitude,
          longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        };
        mapRef.current?.animateToRegion(region, 800);
        setIsCentered(true);
      },
      (error) => {
        console.log(error);
      },
      { enableHighAccuracy: true }
    );
  };

  const handleRegionChange = () => {
    if (isCentered) setIsCentered(false);
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        showsUserLocation={true}
        onPanDrag={handleRegionChange}
        initialRegion={{
          latitude: 14.5995,
          longitude: 120.9842,
          latitudeDelta: 0.5,
          longitudeDelta: 0.5,
        }}
      >
        {locations.map((location) => (
          <Marker
            key={location.id}
            coordinate={{
              latitude: location.latitude,
              longitude: location.longitude,
            }}
            anchor={{ x: 0.5, y: 1 }}
            calloutOffset={{ x: 0, y: 50 }}
            onPress={() => {
              mapRef.current?.animateToRegion(
                {
                  latitude: location.latitude,
                  longitude: location.longitude,
                  latitudeDelta: 0.05,
                  longitudeDelta: 0.05,
                },
                800
              );
            }}
          >
            <Image
              source={require("../assets/iPark Logo.png")}
              style={styles.logo}
              resizeMode="contain"
            />

            {/* 📍 Handle navigation via Callout onPress */}
            <Callout
              tooltip
              onPress={() =>
                navigation.navigate("Details", { location })
              }
            >
              <View style={styles.callout}>
                <Text style={styles.title}>{location.name}</Text>
                <Text style={styles.description}>{location.address}</Text>
                <Text style={styles.goText}>Tap to view details</Text>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>

      {/* 📍 My Location Button */}
      <TouchableOpacity
        style={[
          styles.locationButton,
          isCentered && styles.locationButtonActive,
        ]}
        onPress={getCurrentLocation}
      >
        <Image
          source={
            isCentered
              ? require("../assets/location black.png")
              : require("../assets/location white.png")
          }
          style={styles.locationIcon}
          resizeMode="contain"
        />
      </TouchableOpacity>
    </View>
  );
};

export default MapScreen;

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },

  logo: {
    width: 50,
    height: 50,
  },

  callout: {
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 8,
    minWidth: 160,
    alignItems: "center",
  },

  title: { fontWeight: "bold", marginBottom: 4 },
  description: { fontSize: 13, marginBottom: 6 },
  goText: { color: "#007AFF", fontSize: 12 },

  locationButton: {
    position: "absolute",
    bottom: 40,
    right: 20,
    width: 55,
    height: 55,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff",
    elevation: 6,
  },

  locationButtonActive: {
    backgroundColor: "#ffffff",
  },

  locationIcon: {
    width: 24,
    height: 24,
  },
});
