import React, { useEffect } from 'react'
import { Alert, Button, StyleSheet, Text, View } from 'react-native'
import { fcmServices } from './src/FCMServices'
import { localNotificationService } from './src/LocalNotificationService'

const App = () => {
  useEffect(() => {
    const onRegister = (token) => {
      console.log('[App] onRegister: ', token)
    }

    const onNotification = (notify) => {
      console.log('[App] onNotification: ', notify)
      const options = {
        soundName: 'default',
        playSound: true
      }
      localNotificationService.showNotification(0, notify.title, notify.body, notify, options)
    }

    const onOpenNotification = (notify) => {
      console.log('[App] onOpenNotification: ', notify)
      Alert.alert('Open Notification', notify.body)
    }

    fcmServices.registerAppWithFCM()
    fcmServices.register(onRegister, onNotification, onOpenNotification)
    localNotificationService.configure(onOpenNotification)

    return () => {
      console.log('[App] unRegister')
      fcmServices.unRegister()
      localNotificationService.unRegister()
    }
  }, [])

  const localNotification = () => {
    const options = {
      soundName: 'sample.mp3',
      playSound: true
    }
    localNotificationService.showNotification(0, 'test', 'test', {}, options)
  }

  return (
    <View style={styles.container}>
      <Text>Notificaciones Firebase</Text>
      <Button title="Press Notification Local" onPress={localNotification} />
    </View>
  )
}

export default App

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff'
  }
})
