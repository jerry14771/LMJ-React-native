import React from 'react';
import { Text, StyleSheet } from 'react-native';

const Banner = ({ message, style }) => {
    return (
        <Text style={[styles.banner, style]}>
            {message}
        </Text>
    );
};

const styles = StyleSheet.create({
    banner: {
        position: 'absolute',
        left: -40, // Adjust to position on the left
        top: 10, // Adjust to control vertical position
        width: 120, // Width of the ribbon
        transform: [{ rotate: '-45deg' }],
        backgroundColor: '#FFD700', // Yellow color for the ribbon
        color: 'black',
        paddingVertical: 6,
        textAlign: 'center',
        fontWeight: 'bold',
    },
});

export default Banner;
