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
        <ion-button @click="logMessage">Log Message</ion-button>
     
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/vue';
import { PushNotifications } from '@capacitor/push-notifications';
import { CapacitorHttp,HttpResponse } from '@capacitor/core';
// // npx cap add ios - Generate the native project
// // npx cap copy ios - copy changes to native project
// // npx cap update ios - update ios plugins
// // npx cap sync ios - command runs copy and then update
// // npx cap open ios -  Open the project in Xcode.
// export JAVA_HOME=
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
}

PushNotifications.addListener('registration', token => {
  console.log('Push registration success, token:', token);
  registerToken(token, 1);
  console.log('Device registered for push:', token.value);
  // TODO: send token.value to backend via API, along with current user ID/email
});

PushNotifications.addListener('registrationError', err => {
  console.error('Push registration error:', err.error);
});
  
const initializeNotifications = async () => {
  // Request permission and register
  const permStatus = await PushNotifications.requestPermissions();
  if (permStatus.receive === 'granted') {
    await PushNotifications.register();
    console.log('Push notification permission granted');
    
  }else {
    console.error('Push notification permission not granted');
  }
}
initializeNotifications();

const registerToken = async function(token:any,userId:any) {

  console.log('registerToken called with token:', token, 'and userId:', userId);
  
        try {
            // await RequestAdapter.post(`admin/register-user-notification`, {
            //     token: token.value,
            //     platform: token.platform,
            //     userId: userId,
            // });
           const response = await doPost('http://localhost:4000/admin/register-user-notification', {
                token: token.value,
                platform: token.platform,
                userId: userId,
            });
console.log('Response from backend:', response);

            console.log('Token registered with backend successfully:', token, userId);
        } catch (error) {
            console.error('Failed to register token with backend:', error);
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

};

// Example of a POST request. Note: data
// can be passed as a raw JS Object (must be JSON serializable)
const doPost = async (url:any, data:any) => {
  const options = {
    url: url,
    //headers: { 'X-Fake-Header': 'Fake-Value' },
    data: data,
  };

  const response: HttpResponse = await CapacitorHttp.post(options);

  console.log('Response:', response);
  
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
