import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import React from 'react';
import { useNavigation } from '@react-navigation/native';

const ListComponent = ({ purzinumber ,id, name, address, amount, englishDate, goldWeight, silverWeight, status, book_name }) => {
    const navigation = useNavigation();

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const optionsDate = { day: '2-digit', month: 'short', year: 'numeric' };
        const formattedDate = new Intl.DateTimeFormat('en-GB', optionsDate).format(date);
        return `${formattedDate.replace(/,/, '')}`;
    };

  return (
    <TouchableOpacity style={styles.container} onPress={()=>navigation.navigate('BandhakDetail',{id})}>
      <View style={styles.header}>
        <View style={{ backgroundColor: status === "Rakhti" ? "red" : "green" , padding:3, borderRadius:5 }}><Text style={styles.id}>{purzinumber}</Text></View>
        <Text style={styles.date}>📅 {formatDate(englishDate)}</Text>
      </View>
      <Text style={styles.name}>👤 {name} ({address})</Text>
      <Text style={styles.mobile}>💰 {amount} {'('+book_name+')'}</Text>
      <View style={styles.weights}>
        <Text style={styles.gold}>🥇 {goldWeight}g</Text>
        <Text style={styles.silver}>🥈 {silverWeight}g</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 12,
    borderBottomWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#f9f9f9',
    marginVertical: 6,
    borderRadius: 10,
    elevation: 2,
    margin:10
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  id: {
    fontWeight: '600',
    color: '#fff',
    fontSize:13
  },
  date: {
    color: 'black',
    fontSize: 13,
    fontWeight:"700"
  },
  name: {
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
  },
  mobile: {
    color: '#666',
    marginBottom: 4,
  },
  weights: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  gold: {
    color: '#d4af37',
    fontWeight: 'bold',
  },
  silver: {
    color: '#c0c0c0',
    fontWeight: 'bold',
  },
});

export default ListComponent;
