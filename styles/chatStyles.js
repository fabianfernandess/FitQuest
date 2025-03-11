import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    backgroundImage: {
      flex: 1,
      resizeMode: 'cover',
    },
    container: {
      flex: 1,
      padding: 10,
      paddingTop: 30,
      backgroundColor: 'rgba(0, 0, 0, 0.4)',
    },
    messagesContainer: {
      flex: 1,
    },
    messagesContent: {
      paddingBottom: 20,
    },
    trainerMessage: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: 20,
      fontSize: 16,
    },
    userMessage: {
      flexDirection: 'row-reverse',
      alignItems: 'flex-start',
      marginBottom: 20,
      fontSize: 16,
    },
    profilePic: {
      width: 30,
      height: 30,
      borderRadius: 20,
      marginRight: 10,
    },
    trainerBubble: {
      padding: 15,
      maxWidth: '85%',
      borderRadius: 10,
      backgroundColor: 'rgba(255, 255, 255, 0.08)',
    },
    userBubble: {
      backgroundColor: '#03C988',
      padding: 10,
      borderRadius: 10,
      maxWidth: '80%',
      marginRight: 10,
    },
    trainerText: {
      color: '#fff',
      fontSize: 16,
    },
    userText: {
      color: '#fff',
      fontSize: 16,
    },
    
    videoContainer: {
      width: '100%',
      height: 250, // Adjust height based on your UI
      borderRadius: 10,
      overflow: 'hidden',
      marginVertical: 10,
    },
    video: {
      flex: 1,
      borderRadius: 10,
    },
    
    capturedImage: {
      width: 250,
      height: 150,
      borderRadius: 10,
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingLeft: 10,
      paddingRight: 5,
      paddingVertical: 5,
      backgroundColor: 'rgba(36, 40, 47, 0.6)',
      borderRadius: 10,
      marginHorizontal: 5,
      marginBottom: 20,
    },
    cameraButton: {
      marginHorizontal: 5,
      marginVertical: 5,
    },
    cameraIcon: {
      width: 24,
      height: 24,
    },
    input: {
      flex: 1,
      padding: 10,
      borderRadius: 20,
      color: '#fff',
      fontSize: 16,
    },
    sendButton: {
      backgroundColor: '#03C988',
      padding: 10,
      borderRadius: 10,
      marginLeft: 10,
    },
    sendButtonText: {
      color: '#fff',
      fontSize: 18,
    },
    topNavContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingTop: 65,
      backgroundColor: 'rgba(0, 0, 0, 0.4)',
      paddingVertical: 10,
      paddingHorizontal: 15,
    },
    backButton: {
      padding: 10,
    },
    backIcon: {
      width: 28,
      height: 28,
      tintColor: '#fff',
    },
    titleContainer: {
      flex: 1,
      alignItems: 'center',
    },
    pointsContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: 16,
      backgroundColor: '#353E3A',
    },
    pointsIcon: {
      width: 28,
      height: 28,
      marginRight: 5,
    },
    pointsText: {
      color: '#fff',
      fontSize: 16,
      marginRight: 10,
    },
    cameraContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'black',
    },
    cameraPreview: {
      flex: 1,
      justifyContent: 'flex-end',
      width: '100%',
      height: '100%',
    },
    captureButtonContainer: {
      flex: 0,
      justifyContent: 'center',
      alignItems: 'center',
      paddingBottom: 30,
    },
    captureButton: {
      backgroundColor: '#fff',
      borderRadius: 5,
      padding: 15,
      paddingHorizontal: 20,
    },
    captureButtonText: {
      fontSize: 14,
      color: '#000',
    },
    Loading_backgroundImage: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      resizeMode: 'cover',
    },
    Loading_container: {
      flex: 1,
      justifyContent: 'flex-end',
      alignItems: 'center',
      paddingBottom: 40,
    },
    Loading_welcomeText: {
      color: '#fff',
      fontSize: 21,
      textAlign: 'center',
      marginBottom: 20,
      marginHorizontal: 50,
    },
    progressBarContainer: {
      width: '80%',
      height: 10,
      backgroundColor: '#d8d8d8',
      borderRadius: 5,
      overflow: 'hidden',
    },
    progressBar: {
      height: 10,
      backgroundColor: '#03C988',
      borderRadius: 5,
    },
    completeButton: {
      marginTop: 10,
      padding: 10,
      backgroundColor: '#03C988',
      borderRadius: 10,
    },
    completeButtonText: {
      color: '#fff',
      textAlign: 'center',
      fontSize: 16,
    },
    exerciseDetailsContainer: {
      marginTop: 10,
      padding: 10,
      backgroundColor: '#f0f0f0',
      borderRadius: 8,
    },
    exerciseText: {
      fontSize: 14,
      color: '#333',
    },
  });

  export default styles