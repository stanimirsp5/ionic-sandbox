<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-title>Blank</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Blank</ion-title>
        </ion-toolbar>
      </ion-header>

      <div id="container">
        <strong>Ready to create an app Test?</strong>
        <p>Start with Ionic <a target="_blank" rel="noopener noreferrer" href="https://ionicframework.com/docs/components">UI Components</a></p>
        <ion-button expand="block" @click="logMessage" >Log Message</ion-button>
        
        <ion-button expand="block" @click="handleNotificationInit" >Register To Notification Cloud</ion-button>
        <ion-button expand="block" @click="printDebugLog" >Print Debug Log</ion-button>
      </div>
      <ion-item>
        <ion-textarea :rows="10" :readonly="true" :value="debugMessage"></ion-textarea>
      </ion-item>

    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonContent, IonButton,IonHeader, IonPage, IonTitle, IonToolbar,IonItem, IonTextarea } from '@ionic/vue';
import { PushNotifications } from '@capacitor/push-notifications';
import { CapacitorHttp,HttpResponse,HttpOptions } from '@capacitor/core';
import { ref } from 'vue';
import { isPlatform } from '@ionic/vue';

// // npx cap add ios - Generate the native project
// // npx cap copy ios - copy changes to native project
// // npx cap update ios - update ios plugins
// // npx cap sync ios - command runs copy and then update
// // npx cap open ios -  Open the project in Xcode.
// export JAVA_HOME=/Library/Java/JavaVirtualMachines/jdk-21.jdk/Contents/Home
/*
  npm run build
  npx cap sync ios 
  npx cap open ios
  */
/*
 npm run build
 npx cap sync android 
 npx cap run android
*/

// Team ID (see step 1) SD776V8U3N
// Bundle ID (see step 1) demo.push.notifiations
// Key ID (see step 7) 79UBJV6XLW
// Token value :
// MIGTAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBHkwdwIBAQQg7JEfD9NOg44TNYUq
// jx1lEcY0ZdqSTFKDs31PjOloaLCgCgYIKoZIzj0DAQehRANCAASaUzRgvCP5RCsy
// inldbjnAC+f/jYJRCeWGO7Rf1PM8gdaNOiKqvQ0XoVhaIn0MWMdToEuDmyQqmb2j
// loCXQUwJ

function logMessage() {
  console.log('Button clicked!');
  addDebugMessage('Button clicked!');
}
const debugMessage = ref(''); // Reactive variable for debugMessage
debugMessage.value = 'Debug messages will appear here'; // Initialize debugMessage
function addDebugMessage(newMessage: string) {
  debugMessage.value += (debugMessage.value ? '\n' : '') + newMessage; // Append new message on a new line
}

PushNotifications.addListener('registration', token => {
  registerToken(token, 1);
  console.log('Device registered for push:', token.value);
  addDebugMessage('Device registered for push: ' + token.value);
  // TODO: send token.value to backend via API, along with current user ID/email
});

PushNotifications.addListener('registrationError', err => {
  console.error('Push registration error:', err.error);
  addDebugMessage('Push registration error: ' + err.error);
});
  
const initializeNotifications = async () => {
  addDebugMessage('initializeNotifications called');

  // Request permission and register
  const permStatus = await PushNotifications.requestPermissions();
  addDebugMessage('permStatus called');

  if (permStatus.receive === 'granted') {
    await PushNotifications.register();
    console.log('Push notification permission granted');
    addDebugMessage('Push notification permission granted');
    
  }else {
    console.error('Push notification permission not granted');
    addDebugMessage('Push notification permission not granted');
  }
}

async function handleNotificationInit() {
  try {
    await initializeNotifications();
  } catch (error) {
    console.error('Error during initialization:', error);
    addDebugMessage('Error during initialization: ' + error);
  }
}

async function printDebugLog() {
  console.log('Debug log:', debugMessage.value);
}

const registerToken = async function(token:any,userId:any) {

  console.log('registerToken called with token:', token.value, 'and userId:', userId);
  addDebugMessage('registerToken called with token: ' + token.value + ' and userId: ' + userId);
  
        try {
            // await RequestAdapter.post(`admin/register-user-notification`, {
            //     token: token.value,
            //     platform: token.platform,
            //     userId: userId,
            // });
           const uri =isPlatform('android')? 'http://10.0.2.2:4000' : 'http://localhost:4000';
           const response = await doPost(`${uri}/admin/register-user-notification`, {
                token: token.value,
                platform: isPlatform('android')? 'android' : 'ios',
                userId: userId,
            });

            if(response == null ) {
               return;
            }
            console.log('Response from backend:', response);
            addDebugMessage('Response from backend: ' + JSON.stringify(response));
           
            console.log('Token registered with backend successfully:', token, userId);
            addDebugMessage('Token registered with backend successfully: ' + token.value + ' ' + userId);
        } catch (error) {
            console.error('Failed to register token with backend:', error);
            addDebugMessage('Failed to register token with backend: ' + error);
        }
    }


// Example of a GET request
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const doGet = async () => {
  const options = {
    url: 'https://example.com/my/api',
    headers: { 'X-Fake-Header': 'Fake-Value' },
    params: { size: 'XL' },
  };

  const response: HttpResponse = await CapacitorHttp.get(options);
  console.log('Response:', response);
  addDebugMessage('Response: ' + JSON.stringify(response));

};

// Example of a POST request. Note: data
// can be passed as a raw JS Object (must be JSON serializable)
const doPost = async (url:any, data:any) => {
  const options:HttpOptions = {
    url: url,
    headers: { 'Content-Type': 'application/json' },
    data: data,
  };
  console.log('Data object: ', JSON.stringify(options));
  addDebugMessage('Data object: ' + JSON.stringify(options));
  

  const response: HttpResponse = await CapacitorHttp.post(options);

  console.log('Response: ', JSON.stringify(response));
  addDebugMessage('Response: ' + JSON.stringify(response));
  
};

</script>

<style scoped>
#container {
  text-align: center;
  
  position: absolute;
  left: 0;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
}

#container strong {
  font-size: 20px;
  line-height: 26px;
}

#container p {
  font-size: 16px;
  line-height: 22px;
  
  color: #8c8c8c;
  
  margin: 0;
}

#container a {
  text-decoration: none;
}
</style>
