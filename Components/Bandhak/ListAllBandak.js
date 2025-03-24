import React, { useEffect, useState } from "react";
import { View, Text, FlatList, ActivityIndicator, StyleSheet, TouchableOpacity } from "react-native";
import config from "../../config";
import Header from "../Common/Header";

const ListAllBandak = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const url = `${config.BASE_URL}fetchBandhak.php`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(),
      });
      const result = await response.json();
      console.log(result)
      if (result.status === "success") {
        setData(result.data);
      } else {
        setData([]);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="blue" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header />
      {data.length === 0 ? (
        <Text style={styles.noData}>कोई रिकॉर्ड नहीं मिला</Text>
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <Text style={styles.title}>{item.name}</Text>
                <View style={{ padding: 10, backgroundColor: "red", borderRadius: 30 }}><Text style={{ color: "white", fontWeight: "800", fontSize: 16 }}>{item.purja_no}</Text></View>
              </View>
              <Text style={styles.titleSmall}>{`(` + item.father_name + `)`}</Text>
              <Text style={styles.text}>📖 {item.book_name}</Text>
              <Text style={styles.text}>📞 {item.mobile_no}</Text>
              <Text style={styles.text}>📝 Description: {item.description}</Text>
              {item.gold_weight && <Text style={styles.text}>🪙 Gold: {item.gold_weight} gm</Text>}
              {item.silver_weight && <Text style={styles.text}>💿 Silver: {item.silver_weight} gm</Text>}
              <Text style={styles.text}>💰 Amount: ₹{item.amount_given}</Text>
              <Text style={styles.text}>📅 {item.hindi_date} {item.hindi_month} {item.hindi_year}</Text>
              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <View style={{ backgroundColor:"lightblue", paddingHorizontal:8, paddingVertical:5, borderRadius:5 }}><Text style={[styles.text]}>Status toggler</Text></View>
                <View style={{ flexDirection: "row", gap: 10 }}>
                  <Text style={styles.text}>Edit</Text>
                  <Text style={styles.text}>Delete</Text>
                </View>

              </View>
            </View>
          )}
        />
      )}

      <TouchableOpacity style={styles.refreshButton} onPress={fetchData}>
        <Text style={styles.refreshText}>🔄 Refresh</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f8f8",
  },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 10,
    color: "#333",
  },
  card: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginVertical: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  titleSmall: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  text: {
    fontSize: 16,
    color: "#555",
  },
  noData: {
    textAlign: "center",
    fontSize: 18,
    color: "gray",
    marginTop: 20,
  },
  refreshButton: {
    backgroundColor: "#007bff",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 15,
  },
  refreshText: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "bold",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default ListAllBandak;
