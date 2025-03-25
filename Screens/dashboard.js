import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity } from 'react-native'; // Added missing ScrollView import

const DashboardScreen = ({ route, navigation }) => {
    // Placeholder data
    const {
        name,
        recommended_calories_per_day,
        points,
        tasks,
    } = route.params || {};

    const exercisesCompleted = "4/5"; // This variable is not used.
    const goalsCompleted = 5;
    const totalGoals = 10;

    const days = [
        { key: 'mon', abbr: 'M' },
        { key: 'tue', abbr: 'Tu' },
        { key: 'wed', abbr: 'W' },
        { key: 'thu', abbr: 'Th' },
        { key: 'fri', abbr: 'F' },
        { key: 'sat', abbr: 'Sa' },
        { key: 'sun', abbr: 'Su' }
    ];



    return (
        <View style={styles.container}>
            {/* Background Image */}
            <Image
                source={require('../assets/dashboardBG.png')} // Replace with your image path
                style={styles.backgroundImage}
            />

            {/* Top Bar */}
            <View style={styles.topBar}>
                <Image
                    source={require('../assets/user.png')}
                    style={styles.avatar}
                />
                <Text style={styles.points}>{points}</Text>
                <TouchableOpacity style={styles.upgradeButton} onPress={() => navigation.navigate('Upgrade')}>
                    <Text style={styles.upgradeText}>Upgrade</Text>
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
                {/* Greeting Section */}
                <View style={styles.greetingSection}>
                    <Text style={styles.date}>5th March 2025</Text>
                    <Text style={styles.greeting}>{name}, Let's conquer the day!</Text>
                    <View style={styles.goalsContainer}>
                        <Text style={styles.goalsText}>{goalsCompleted}/{totalGoals} goals completed</Text>
                    </View>
                </View>

                {/* Data Cards */}
                <View style={styles.dataCards}>
                    <View style={styles.dataCard}>
                        <Text style={styles.cardTitle}>Daily Calories</Text>
                        <Text style={styles.cardValue}>{recommended_calories_per_day}</Text>
                    </View>
                    <View style={[styles.dataCard, { marginLeft: 16 }]}>
                        <Text style={styles.cardTitle}>Exercises</Text>
                        <Text style={styles.cardValue}>{tasks?.length || 0}</Text> {/* added a fallback in case tasks is undefined */}
                    </View>
                </View>

                {/* Day Selection */}
                <View style={styles.daySelection}>
                    {days.map((day) => (
                        <View
                            key={day.key}  // Now using unique key
                            style={styles.day}
                        >
                            <Text style={styles.dayText}>
                                {day.abbr}
                            </Text>
                        </View>
                    ))}
                </View>

                {/* Today's Plan */}
                <View style={styles.todaysPlan}>
                    <Text style={styles.planTitle}>Today's plan</Text>
                    {tasks && tasks.length > 0 ? ( // Check if tasks exists and has length
                        tasks.map((item, index) => (
                            <View key={index} style={styles.planItem}>
                                <Text style={styles.planTime}>x</Text>
                                <Text style={styles.planText}>{item}</Text> {/* changed from tasks to item */}
                            </View>
                        ))
                    ) : (
                        <Text style={styles.noPlanText}>No tasks for today.</Text> // added a message for when there are no tasks
                    )}
                </View>
            </ScrollView>

            {/* Bottom Bar */}
            <View style={styles.bottomBar}>
                <TouchableOpacity onPress={() => navigation.navigate('Chat')}>
                  <Image
                      source={require("../assets/avatarAI.png")}
                      style={styles.bottomAvatar}
                  />
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    scrollView: {
        flex: 1,
    },
    backgroundImage: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        opacity: 0.8,
        resizeMode: 'cover',
    },
    topBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        zIndex: 1,
        marginTop: 30, // Added for better spacing
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
    },
    points: {
        color: '#fff',
        fontSize: 18,
    },
    upgradeButton: {
        borderWidth: 1,
        borderColor: '#00FF00',
        borderRadius: 20,
        paddingHorizontal: 12,
        paddingVertical: 6,
    },
    upgradeText: {
        color: '#00FF00',
        fontSize: 16,
    },
    greetingSection: {
        padding: 16,
        zIndex: 1,
    },
    date: {
        color: '#888',
        fontSize: 16,
    },
    greeting: {
        color: '#fff',
        fontSize: 24, // Increased size
        fontWeight: 'bold',
        marginTop: 8,
    },
    goalsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 16, // Increased spacing
    },
    goalsText: {
        color: '#fff',
        fontSize: 16,
    },
    dataCards: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        zIndex: 1,
        marginBottom: 16,
    },
    dataCard: {
        flex: 1,
        backgroundColor: 'rgba(34, 34, 34, 0.8)', // Added transparency
        borderRadius: 10,
        padding: 16,
        minHeight: 100, // Added minimum height
    },
    cardTitle: {
        color: '#fff',
        fontSize: 16,
        marginBottom: 8, // Added spacing
    },
    cardValue: {
        color: '#fff',
        fontSize: 24, // Increased size
        fontWeight: 'bold',
    },
    daySelection: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        padding: 16,
        zIndex: 1,
        backgroundColor: 'rgba(34, 34, 34, 0.8)', // Added background
        borderRadius: 10,
        marginHorizontal: 16,
        marginBottom: 16,
    },
    day: {
        width: 40, // Increased size
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    dayText: {
        color: '#fff', // Changed to white
        fontSize: 16,
    },
    todaysPlan: {
        padding: 16,
        zIndex: 1,
        backgroundColor: 'rgba(34, 34, 34, 0.8)', // Added background
        borderRadius: 10,
        marginHorizontal: 16,
        marginBottom: 16,
    },
    planTitle: {
        color: '#fff',
        fontSize: 20, // Increased size
        fontWeight: 'bold',
        marginBottom: 16,
    },
    planItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#333',
    },
    planTime: {
        color: '#888',
        marginRight: 16,
        width: 70, // Fixed width for alignment
    },
    planText: {
        color: '#fff',
        flex: 1,
        fontSize: 16,
    },
    bottomBar: {
        alignItems: 'center',
        paddingVertical: 16,
        zIndex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.7)', // Added background
    },
    bottomAvatar: {
        width: 60, // Increased size
        height: 60,
        borderRadius: 30,
    },
    noPlanText: { // Style for message when there are no tasks
      color: '#fff',
      fontStyle: 'italic',
      textAlign: 'center'
    }
});

export default DashboardScreen;

