import messaging from '@react-native-firebase/messaging'
import { Platform } from 'react-native'

class FCMServices {
  register = (onRegister, onNotification, onOpenNotification) => {
    this.checkPermission(onRegister)
    this.createNotificationListeners(onRegister, onNotification, onOpenNotification)
  }

  registerAppWithFCM = async () => {
    if (Platform.OS === 'ios') {
      await messaging().registerDeviceForRemoteMessages()
      await messaging().setAutoInitEnabled(true)
    }
  }

  checkPermission = (onRegister) => {
    messaging().hasPermission()
      .then(enabled => {
        if (enabled) {
          this.getToken(onRegister)
        } else {
          this.requestPermission(onRegister)
        }
      })
      .catch(error => {
        console.log('[FCMServices] permission rejected', error)
      })
  }

  getToken = (onRegister) => {
    messaging().getToken()
      .then(fcmToken => {
        if (fcmToken) {
          onRegister(fcmToken)
        } else {
          console.log('[FCMServices] User does not have a device token')
        }
      })
      .catch(error => {
        console.log('[FCMServices] getToken rejected', error)
      })
  }

  requestPermission = (onRegister) => {
    messaging().requestPermission()
      .then(() => {
        this.getToken(onRegister)
      })
      .catch(error => {
        console.log('[FCMServices] request permission rejected', error)
      })
  }

  deleteToken = () => {
    console.log('[FCMServices] deleteToken')
    messaging().deleteToken()
      .catch(error => {
        console.log('[FCMServices] delete token error', error)
      })
  }

  createNotificationListeners = (onRegister, onNotification, onOpenNotification) => {
    // cuando la aplicacion esta corriendo pero en background
    messaging()
      .onNotificationOpenedApp(remoteMessage => {
        console.log('[FCMServices] onNotificationOpenedApp')
        if (remoteMessage) {
          const notification = remoteMessage.notification
          onOpenNotification(notification)
        }
      })

    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        console.log('[FCMServices] getInitialNotification')
        if (remoteMessage) {
          const notification = remoteMessage.notification
          onOpenNotification(notification)
        }
      })

    // mensajes de estado anteriores
    this.messageListener = messaging().onMessage(async remoteMessage => {
      console.log('[FCMServices] a new FCM message arrived', remoteMessage)
      if (remoteMessage) {
        let notification = null
        if (Platform.OS === 'ios') {
          notification = remoteMessage.data.notification
        } else {
          notification = remoteMessage.notification
        }
        onNotification(notification)
      }
    })

    // se activa cuando tiene un nuevo token
    messaging().onTokenRefresh(fcmToken => {
      console.log('[FCMServices] new token refresh')
      onRegister(fcmToken)
    })
  }

  unRegister = () => {
    this.messageListener()
  }
}

export const fcmServices = new FCMServices()
// export default FCMServices
