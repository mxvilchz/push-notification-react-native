import PushNotification from 'react-native-push-notification'
import PushNotificationIOS from '@react-native-community/push-notification-ios'
import { Platform } from 'react-native'

class LocalNotificationService {
  configure = (onOpenNotification) => {
    PushNotification.createChannel(
      {
        channelId: 'sound-channel-id', // (required)
        channelName: 'Sound channel', // (required)
        channelDescription: 'A sound channel', // (optional) default: undefined.
        soundName: 'sample.mp3', // (optional) See `soundName` parameter of `localNotification` function
        importance: 4, // (optional) default: 4. Int value of the Android notification importance
        vibrate: true // (optional) default: true. Creates the default vibration patten if true.
      },
      (created) => console.log(`createChannel 'sound-channel-id' returned '${created}'`) // (optional) callback returns whether the channel was created, false means it already existed.
    )

    // Clear badge number at start
    PushNotification.getApplicationIconBadgeNumber(function (number) {
      if (number > 0) {
        PushNotification.setApplicationIconBadgeNumber(0)
      }
    })

    PushNotification.getChannels(function (channels) {
      console.log(channels)
    })
    PushNotification.configure({

      // (optional) Called when Token is generated (iOS and Android)
      onRegister: function (token) {
        console.log('[LocalNotificationService] onRegister', token)
      },

      // (required) Called when a remote is received or opened, or local notification is opened
      onNotification: function (notification) {
        console.log('[LocalNotificationService] onNotification', notification)
        if (!notification?.data) {
          return
        }

        notification.userInteraction = true
        onOpenNotification(Platform.OS === 'ios' ? notification.data.item : notification.data)

        if (Platform.OS === 'ios') {
          // (required) Called when a remote is received or opened, or local notification is opened
          notification.finish(PushNotificationIOS.FetchResult.NoData)
        }
      },

      // (optional) Called when Registered Action is pressed and invokeApp is false, if true onNotification will be called (Android)
      onAction: function (notification) {
        console.log('ACTION:', notification.action)
        console.log('NOTIFICATION:', notification)

        // process the action
      },

      // (optional) Called when the user fails to register for remote notifications. Typically occurs when APNS is having issues, or the device is a simulator. (iOS)
      onRegistrationError: function (err) {
        console.error(err.message, err)
      },

      // IOS ONLY (optional): default: all - Permissions to register.
      permissions: {
        alert: true,
        badge: true,
        sound: true
      },

      // Should the initial notification be popped automatically
      // default: true
      popInitialNotification: true,

      /**
       * (optional) default: true
       * - Specified if permissions (ios) and token (android and ios) will requested or not,
       * - if not, you must call PushNotificationsHandler.requestPermissions() later
       * - if you are not using remote notification or do not have Firebase installed, use this:
       *     requestPermissions: Platform.OS === 'ios'
       */
      requestPermissions: true
    })
  }

  unRegister = () => {
    PushNotification.unregister()
  }

  showNotification = (id, title, message, data = {}, option = {}) => {
    PushNotification.localNotification({
      // Android only poperties
      ...this.buildAndroidNotification(id, title, message, data, option),
      // iOS only poperties
      ...this.buildIOSNotification(id, title, message, data, option),
      // iOS and Android
      title: title || '',
      message: message || '',
      playSound: true,
      soundName: 'sample.mp3'
    })
  }

  buildAndroidNotification = (id, title, message, data = {}, option = {}) => {
    return {
      channelId: 'sound-channel-id',
      actions: ['Yes', 'No'],
      id: id,
      autoCancel: true,
      largeIcon: option.largeIcon || 'ic_launcher',
      smallIcon: option.smallIcon || 'ic_notification',
      bixText: message || '',
      subtext: title || '',
      vibrate: option.vibrate || true,
      vibration: option.vibration || 300,
      priority: option.priority || 'high',
      importance: option.importance || 'high',
      data: data
    }
  }

  buildIOSNotification = (id, title, message, data = {}, option = {}) => {
    return {
      alertIcon: option.alertIcon || 'view',
      categroy: option.categroy || '',
      userInfo: {
        id: id,
        item: data
      }
    }
  }

  cancelAllLicationNotifications = () => {
    if (Platform.OS === 'ios') {
      PushNotificationIOS.removeAllDeliveredNotifications()
    } else {
      PushNotification.cancelAllLocalNotifications()
    }
  }

  removeDeliveredNotificationsById = (notificationId) => {
    console.log('[LocalNotificationService] removeDeliveredNotificationsById', notificationId)
    PushNotification.cancelLocalNotifications({ id: `${notificationId}` })
  }
}

export const localNotificationService = new LocalNotificationService()
// export default LocalNotificationService
