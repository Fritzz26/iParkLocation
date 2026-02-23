import React, { useEffect, useRef, useState, useCallback } from "react";
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
  Modal,
  Animated,
  PanResponder,
  Dimensions,
  Keyboard,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import Geolocation from "@react-native-community/geolocation";
import { locations } from "../data/locations";
import LocationDetailsScreen from "./LocationDetailsScreen";

const { height: screenHeight } = Dimensions.get("window");

const MapScreen = () => {
  const mapRef = useRef(null);

  // Bottom sheet constants
  const SNAP_POINTS = {
    hidden: screenHeight,
    half: screenHeight * 0.4,
    full: screenHeight * 0.1, // 10% from top
  };

  const translateY = useRef(new Animated.Value(SNAP_POINTS.hidden)).current;
  const lastSnapPoint = useRef(SNAP_POINTS.hidden);
  const isAnimating = useRef(false);

  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const [selectedLocation, setSelectedLocation] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [isCentered, setIsCentered] = useState(false);
  const [search, setSearch] = useState("");
  const [filteredLocations, setFilteredLocations] = useState([]);
  const [showResults, setShowResults] = useState(false);

  // Safe animate helper
  const safeAnimateToRegion = (region, duration = 700) => {
    if (mapRef.current && mapRef.current.animateToRegion) {
      mapRef.current.animateToRegion(region, duration);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => requestLocationPermission(), 300);
    return () => clearTimeout(timer);
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
        safeAnimateToRegion(
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
      setFilteredLocations(locations);
    }
  };

  const handleMapPress = (event) => {
    if (event.nativeEvent.action === "marker-press") return;
    setSearch("");
    setFilteredLocations([]);
    setShowResults(false);
  };

  const animateToPoint = useCallback((point) => {
    if (isAnimating.current) return;

    isAnimating.current = true;
    lastSnapPoint.current = SNAP_POINTS[point];

    Animated.timing(translateY, {
      toValue: SNAP_POINTS[point],
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      isAnimating.current = false;
    });
  }, []);

  const openModal = (location) => {
    Keyboard.dismiss();

    // Set location first
    setSelectedLocation(location);

    // Show modal
    setModalVisible(true);

    // Use requestAnimationFrame to ensure modal is rendered
    requestAnimationFrame(() => {
      animateToPoint('half');
    });
  };

  const closeModal = () => {
    animateToPoint('hidden');

    // Clear location after animation completes
    setTimeout(() => {
      setModalVisible(false);
      setSelectedLocation(null);
    }, 300);
  };

  const teleportToLocation = (location) => {
    safeAnimateToRegion({
      latitude: location.latitude,
      longitude: location.longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    });
    setSearch(location.name);
    setShowResults(false);
    setFilteredLocations([]);
    openModal(location);
  };

  // Create pan responder
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gesture) => {
        return !isAnimating.current && Math.abs(gesture.dy) > 5;
      },
      onPanResponderGrant: () => {
        translateY.stopAnimation();
        lastSnapPoint.current = translateY._value;
      },
      onPanResponderMove: (_, gesture) => {
        if (isAnimating.current) return;

        let newPos = lastSnapPoint.current + gesture.dy;
        // Clamp between full and hidden
        newPos = Math.max(SNAP_POINTS.full, Math.min(SNAP_POINTS.hidden, newPos));
        translateY.setValue(newPos);
      },
      onPanResponderRelease: (_, gesture) => {
        if (isAnimating.current) return;

        const currentPos = lastSnapPoint.current + gesture.dy;
        const velocity = gesture.vy;

        // Determine snap point based on velocity and position
        if (velocity < -0.5) { // Swiping up fast
          animateToPoint('full');
        } else if (velocity > 0.5) { // Swiping down fast
          if (currentPos < SNAP_POINTS.half) {
            animateToPoint('half');
          } else {
            closeModal();
          }
        } else {
          // Find closest snap point
          const distances = {
            full: Math.abs(currentPos - SNAP_POINTS.full),
            half: Math.abs(currentPos - SNAP_POINTS.half),
            hidden: Math.abs(currentPos - SNAP_POINTS.hidden),
          };

          const closest = Object.keys(distances).reduce((a, b) =>
            distances[a] < distances[b] ? a : b
          );

          if (closest === 'hidden') {
            closeModal();
          } else {
            animateToPoint(closest);
          }
        }
      },
    })
  ).current;

  return (
    <View style={styles.container}>
      {/* SEARCH */}
      <View style={styles.searchContainer}>
        <TextInput
          style={[
            styles.searchInput,
            { backgroundColor: isDark ? "#1e1e1e" : "#fff", color: isDark ? "#fff" : "#000" },
          ]}
          placeholder="Search location..."
          placeholderTextColor={isDark ? "#aaa" : "#555"}
          value={search}
          onFocus={() => {
            setShowResults(true);
            if (!search.length) setFilteredLocations(locations);
          }}
          onChangeText={handleSearch}
        />
        {showResults && filteredLocations.length > 0 && (
          <View style={styles.searchResults}>
            <FlatList
              data={filteredLocations}
              keyExtractor={(item) => item.id.toString()}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.resultItem} onPress={() => teleportToLocation(item)}>
                  <Text>{item.name}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        )}
      </View>

      {/* MAP */}
      <MapView
        ref={mapRef}
        style={styles.map}
        showsUserLocation
        onPanDrag={handleRegionChange}
        onPress={handleMapPress}
        initialRegion={{ latitude: 14.5995, longitude: 120.9842, latitudeDelta: 0.5, longitudeDelta: 0.5 }}
      >
        {locations.map((loc) => (
          <Marker
            key={loc.id}
            coordinate={{ latitude: loc.latitude, longitude: loc.longitude }}
            anchor={{ x: 0.5, y: 1 }}
            onPress={() => teleportToLocation(loc)}
          >
            <Image
              source={require("../assets/iParkPinWhiteBlue.png")}
              style={{ width: 40, height: 40 }}
              resizeMode="contain"
            />
          </Marker>
        ))}
      </MapView>

      {/* LOCATION BUTTON */}
      <TouchableOpacity style={styles.locationButton} onPress={getCurrentLocation}>
        <Image
          source={isCentered ? require("../assets/location black.png") : require("../assets/location white.png")}
          style={{ width: 24, height: 24 }}
        />
      </TouchableOpacity>

      {/* BOTTOM SHEET MODAL */}
      <Modal
        transparent
        visible={modalVisible}
        animationType="none"
        onRequestClose={closeModal}
      >
        <View style={StyleSheet.absoluteFillObject}>
          {/* Semi-transparent backdrop */}
          <TouchableOpacity
            style={styles.backdrop}
            activeOpacity={1}
            onPress={closeModal}
          />

          {/* Bottom Sheet */}
          <Animated.View
            {...panResponder.panHandlers}
            style={[
              styles.bottomSheet,
              {
                transform: [{ translateY }],
              }
            ]}
          >
            <View style={styles.dragIndicator} />
            {selectedLocation && (
              <LocationDetailsScreen
                key={`location-${selectedLocation.id}`}
                location={selectedLocation}
              />
            )}
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  searchContainer: {
    position: "absolute",
    top: 15,
    left: 20,
    right: 20,
    zIndex: 10
  },
  searchInput: {
    height: 45,
    borderRadius: 10,
    paddingHorizontal: 15
  },
  searchResults: {
    backgroundColor: "#fff",
    borderRadius: 10,
    marginTop: 5,
    maxHeight: 200
  },
  resultItem: {
    padding: 12,
    borderBottomWidth: 0.5,
    borderColor: "#ddd"
  },
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    zIndex: 5,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  bottomSheet: {
    position: "absolute",
    bottom: Platform.OS === 'ios' ? -80 : 0, // iOS: -80, Android: 0
    left: 0,
    right: 0,
    height: Platform.OS === 'ios' ? screenHeight + 0 : screenHeight, // Adjust height for iOS
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 10,

    // Additional iOS-specific shadow props
    ...Platform.select({
      ios: {
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  dragIndicator: {
    width: 40,
    height: 5,
    backgroundColor: "#ccc",
    alignSelf: "center",
    borderRadius: 3,
    marginBottom: 10,
    marginTop: 5
  },
});

export default MapScreen;