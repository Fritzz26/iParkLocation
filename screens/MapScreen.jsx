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
import LocationDetailsModal from "./LocationDetailsScreen"; // adjust the path if needed

const { height: screenHeight } = Dimensions.get("window");

const MapScreen = () => {
  const mapRef = useRef(null);

  const HALF_HEIGHT = screenHeight * 0.55;
  const FULL_HEIGHT = screenHeight * 0.9;

  const translateY = useRef(new Animated.Value(screenHeight)).current;
  const startY = useRef(0);

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
      if (granted === PermissionsAndroid.RESULTS.GRANTED) getCurrentLocation();
    } else getCurrentLocation();
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
    setFilteredLocations(
      text.length > 0
        ? locations.filter((loc) =>
          loc.name.toLowerCase().includes(text.toLowerCase())
        )
        : []
    );
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

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dy) > 5,
      onPanResponderGrant: () => {
        translateY.stopAnimation((current) => {
          startY.current = current;
        });
      },
      onPanResponderMove: (_, gesture) => {
        let newPos = startY.current + gesture.dy;
        if (newPos < screenHeight - FULL_HEIGHT) newPos = screenHeight - FULL_HEIGHT;
        if (newPos > screenHeight) newPos = screenHeight;
        translateY.setValue(newPos);
      },
      onPanResponderRelease: (_, gesture) => {
        const currentY = startY.current + gesture.dy;
        const halfPos = screenHeight - HALF_HEIGHT;
        const fullPos = screenHeight - FULL_HEIGHT;
        if (gesture.dy < -50) {
          Animated.timing(translateY, { toValue: fullPos, duration: 250, useNativeDriver: true }).start();
        } else if (gesture.dy > 50) {
          closeModal();
        } else {
          Animated.timing(translateY, {
            toValue: Math.abs(currentY - halfPos) < Math.abs(currentY - fullPos) ? halfPos : fullPos,
            duration: 250,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  const toggleModalHeight = () => {
    if (!selectedLocation) return;
    translateY.stopAnimation((current) => {
      const fullPos = screenHeight - FULL_HEIGHT;
      const halfPos = screenHeight - HALF_HEIGHT;
      Animated.timing(translateY, {
        toValue: current > fullPos + 10 ? fullPos : halfPos,
        duration: 250,
        useNativeDriver: true,
      }).start();
    });
  };

  const openInGoogleMaps = () => {
    if (!selectedLocation) return;
    Linking.openURL(
      `https://www.google.com/maps/search/?api=1&query=${selectedLocation.latitude},${selectedLocation.longitude}`
    );
  };

  return (
    <View style={styles.container}>
      {/* Search */}
      <View style={styles.searchContainer}>
        <TextInput
          style={[
            styles.searchInput,
            { backgroundColor: isDark ? "#1e1e1e" : "#fff", color: isDark ? "#fff" : "#000" },
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
                <TouchableOpacity style={styles.resultItem} onPress={() => handleSelectLocation(item)}>
                  <Text>{item.name}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        )}
      </View>

      {/* Map */}
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
        {locations.map((loc) => (
          <Marker
            key={loc.id}
            coordinate={{ latitude: loc.latitude, longitude: loc.longitude }}
            anchor={{ x: 0.5, y: 1 }}
            onPress={() => openModal(loc)}
          >
            <Image source={require("../assets/iParkPinWhiteBlue.png")} style={{ width: 40, height: 40 }} resizeMode="contain" />
          </Marker>
        ))}
      </MapView>

      {/* My Location */}
      <TouchableOpacity style={styles.locationButton} onPress={getCurrentLocation}>
        <Image
          source={isCentered ? require("../assets/location black.png") : require("../assets/location white.png")}
          style={{ width: 24, height: 24 }}
        />
      </TouchableOpacity>

      {/* Bottom Modal */}
      <Modal transparent visible={modalVisible} animationType="none">
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={{ flex: 1 }} onPress={closeModal} />
          <Animated.View style={[styles.bottomSheet, { transform: [{ translateY }] }]}>
            <View {...panResponder.panHandlers}>
              <TouchableOpacity onPress={toggleModalHeight} activeOpacity={0.7}>
                <View style={styles.dragIndicator} />
              </TouchableOpacity>
            </View>

            {selectedLocation && <LocationDetailsModal location={selectedLocation} />}
          </Animated.View>
        </View>
      </Modal>
    </View >
  );
};

export default MapScreen;

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
  bottomSheet: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    height: Platform.OS === "ios" ? "95%" : "103%",
    backgroundColor: "#fff",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 20,
  },
  dragIndicator: { width: 50, height: 8, backgroundColor: "#ccc", alignSelf: "center", borderRadius: 3, marginBottom: 0 },

  title: { fontSize: 22, fontWeight: "bold" },
  address: { marginBottom: 10, color: "#555" },
  image: { width: "100%", height: 220, borderRadius: 15 },
  imageBorderLine: { borderBottomWidth: 1, borderBottomColor: "#ccc", marginTop: 10 }, // <--- Added borderline
  customButton: { backgroundColor: "#007AFF", padding: 12, borderRadius: 20, alignItems: "center", marginTop: 15 },
  customButtonText: { color: "#fff", fontWeight: "bold" },
});