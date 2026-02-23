import React, { useEffect, useRef, useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Image,
  PermissionsAndroid,
  Platform,
  TextInput,
  FlatList,
  useColorScheme,
  Linking,
  ActivityIndicator,
  ScrollView,
  Modal,
  Animated,
  PanResponder,
  Dimensions,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import Geolocation from "@react-native-community/geolocation";
import { locations } from "../data/locations";

const { height: screenHeight } = Dimensions.get("window");

const MapScreen = () => {
  const mapRef = useRef(null);

  const HALF_HEIGHT = screenHeight * 0.55;
  const FULL_HEIGHT = screenHeight * 0.9;

  const translateY = useRef(new Animated.Value(screenHeight)).current;
  const startY = useRef(0); // capture initial position when drag starts

  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const [selectedLocation, setSelectedLocation] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [isCentered, setIsCentered] = useState(false);
  const [search, setSearch] = useState("");
  const [filteredLocations, setFilteredLocations] = useState([]);
  const [loadingImage, setLoadingImage] = useState(true);

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
        mapRef.current?.animateToRegion(
          { latitude, longitude, latitudeDelta: 0.05, longitudeDelta: 0.05 },
          800
        );
        setIsCentered(true);
      },
      (error) => console.log(error),
      { enableHighAccuracy: true }
    );
  };

  const handleRegionChange = () => {
    if (isCentered) setIsCentered(false);
  };

  const handleSearch = (text) => {
    setSearch(text);
    if (text.length > 0) {
      const filtered = locations.filter((loc) =>
        loc.name.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredLocations(filtered);
    } else {
      setFilteredLocations([]);
    }
  };

  const handleSelectLocation = (location) => {
    mapRef.current?.animateToRegion(
      {
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      },
      800
    );
    setSearch(location.name);
    setFilteredLocations([]);
  };

  // ------------------ MODAL FUNCTIONS ------------------

  const openModal = (location) => {
    setSelectedLocation(location);
    setModalVisible(true);
    setLoadingImage(true);

    Animated.timing(translateY, {
      toValue: screenHeight - HALF_HEIGHT,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const closeModal = () => {
    Animated.timing(translateY, {
      toValue: screenHeight,
      duration: 250,
      useNativeDriver: true,
    }).start(() => setModalVisible(false));
  };

  // ------------------ PANRESPONDER FOR DRAG INDICATOR ONLY ------------------

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dy) > 5,
      onPanResponderGrant: () => {
        translateY.stopAnimation((current) => {
          startY.current = current; // store current translateY at drag start
        });
      },
      onPanResponderMove: (_, gesture) => {
        let newPosition = startY.current + gesture.dy;
        if (newPosition < screenHeight - FULL_HEIGHT) newPosition = screenHeight - FULL_HEIGHT;
        if (newPosition > screenHeight) newPosition = screenHeight;
        translateY.setValue(newPosition);
      },
      onPanResponderRelease: (_, gesture) => {
        const currentY = startY.current + gesture.dy;
        if (gesture.dy < -50) {
          // swipe up
          Animated.timing(translateY, {
            toValue: screenHeight - FULL_HEIGHT,
            duration: 250,
            useNativeDriver: true,
          }).start();
        } else if (gesture.dy > 50) {
          // swipe down
          closeModal();
        } else {
          // snap to nearest: half or full
          const halfPosition = screenHeight - HALF_HEIGHT;
          const fullPosition = screenHeight - FULL_HEIGHT;
          const distanceToHalf = Math.abs(currentY - halfPosition);
          const distanceToFull = Math.abs(currentY - fullPosition);
          Animated.timing(translateY, {
            toValue: distanceToHalf < distanceToFull ? halfPosition : fullPosition,
            duration: 250,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  // ------------------ TAP DRAG INDICATOR ------------------

  const toggleModalHeight = () => {
    if (!selectedLocation) return;

    translateY.stopAnimation((current) => {
      const FULL_POSITION = screenHeight - FULL_HEIGHT;
      const HALF_POSITION = screenHeight - HALF_HEIGHT;

      if (current > FULL_POSITION + 10) {
        // snap to full
        Animated.timing(translateY, {
          toValue: FULL_POSITION,
          duration: 250,
          useNativeDriver: true,
        }).start();
      } else {
        // snap to half
        Animated.timing(translateY, {
          toValue: HALF_POSITION,
          duration: 250,
          useNativeDriver: true,
        }).start();
      }
    });
  };

  const openInGoogleMaps = () => {
    if (!selectedLocation) return;
    const url = `https://www.google.com/maps/search/?api=1&query=${selectedLocation.latitude},${selectedLocation.longitude}`;
    Linking.openURL(url);
  };

  return (
    <View style={styles.container}>
      {/* 🔎 Search */}
      <View style={styles.searchContainer}>
        <TextInput
          style={[
            styles.searchInput,
            {
              backgroundColor: isDark ? "#1e1e1e" : "#fff",
              color: isDark ? "#fff" : "#000",
            },
          ]}
          placeholder="Search location..."
          placeholderTextColor={isDark ? "#aaa" : "#555"}
          value={search}
          onChangeText={handleSearch}
        />
        {filteredLocations.length > 0 && (
          <View style={styles.searchResults}>
            <FlatList
              data={filteredLocations}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.resultItem}
                  onPress={() => handleSelectLocation(item)}
                >
                  <Text>{item.name}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        )}
      </View>

      {/* 🗺 Map */}
      <MapView
        ref={mapRef}
        style={styles.map}
        showsUserLocation
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
            coordinate={{ latitude: location.latitude, longitude: location.longitude }}
            anchor={{ x: 0.5, y: 1 }}
            onPress={() => {
              mapRef.current?.animateToRegion(
                { latitude: location.latitude, longitude: location.longitude, latitudeDelta: 0.05, longitudeDelta: 0.05 },
                800
              );
              openModal(location);
            }}
          >
            <Image
              source={require("../assets/iParkPinWhiteBlue.png")}
              style={{ width: 50, height: 50 }}
              resizeMode="contain"
            />
          </Marker>
        ))}
      </MapView>

      {/* 📍 Location Button */}
      <TouchableOpacity style={styles.locationButton} onPress={getCurrentLocation}>
        <Image
          source={
            isCentered
              ? require("../assets/location black.png") // when centered
              : require("../assets/location white.png") // when not centered
          }
          style={{ width: 24, height: 24 }}
        />
      </TouchableOpacity>

      {/* 🔥 BOTTOM MODAL */}
      <Modal transparent visible={modalVisible} animationType="none">
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={{ flex: 1 }} onPress={closeModal} />

          <Animated.View style={[styles.bottomSheet, { transform: [{ translateY }] }]}>
            {/* DRAG INDICATOR ONLY */}
            <View {...panResponder.panHandlers}>
              <TouchableOpacity onPress={toggleModalHeight} activeOpacity={0.7}>
                <View style={styles.dragIndicator} />
              </TouchableOpacity>
            </View>

            {selectedLocation && (
              <ScrollView>
                <Text style={styles.title}>{selectedLocation.name}</Text>
                <Text style={styles.address}>{selectedLocation.address}</Text>
                <Text>{selectedLocation.parkingType}</Text>
                <Text style={{ color: "green" }}>{selectedLocation.openingHours}</Text>

                <TouchableOpacity style={styles.customButton} onPress={openInGoogleMaps}>
                  <Text style={styles.customButtonText}>Open in Google Maps</Text>
                </TouchableOpacity>

                <View style={{ marginTop: 15 }}>
                  {loadingImage && <ActivityIndicator size="large" />}
                  <Image
                    source={typeof selectedLocation.image === "number" ? selectedLocation.image : { uri: selectedLocation.image }}
                    style={styles.image}
                    resizeMode="cover"
                    onLoadEnd={() => setLoadingImage(false)}
                  />
                </View>
              </ScrollView>
            )}
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
};

export default MapScreen;

// ------------------- STYLES -------------------
const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },

  searchContainer: { position: "absolute", top: 15, left: 20, right: 20, zIndex: 10 },
  searchInput: { height: 45, borderRadius: 10, paddingHorizontal: 15 },
  searchResults: { backgroundColor: "#fff", borderRadius: 10, marginTop: 5, maxHeight: 150 },
  resultItem: { padding: 12, borderBottomWidth: 0.5, borderColor: "#ddd" },

  locationButton: {
    position: "absolute",
    bottom: 40,
    right: 20,
    width: 55,
    height: 55,
    borderRadius: 28,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    elevation: 6,
  },

  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" },
  bottomSheet: { position: "absolute", bottom: 0, width: "100%", height: "90%", backgroundColor: "#fff", borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 20 },
  dragIndicator: { width: 50, height: 5, backgroundColor: "#ccc", alignSelf: "center", borderRadius: 3, marginBottom: 10 },

  title: { fontSize: 22, fontWeight: "bold" },
  address: { marginBottom: 10, color: "#555" },
  image: { width: "100%", height: 220, borderRadius: 15 },
  customButton: { backgroundColor: "#007AFF", padding: 12, borderRadius: 20, alignItems: "center", marginTop: 15 },
  customButtonText: { color: "#fff", fontWeight: "bold" },
});