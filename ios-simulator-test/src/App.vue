<template>
  <ion-app>
    <ion-page>
      <ion-header>
        <ion-toolbar>
          <ion-title>ESP32C BLE 2</ion-title>
        </ion-toolbar>
      </ion-header>

      <ion-content :fullscreen="true" class="ion-padding">
        <ion-card>
          <ion-card-header>
            <ion-card-title>Device</ion-card-title>
            <ion-card-subtitle>Stemosoft-Setup</ion-card-subtitle>
          </ion-card-header>
          <ion-card-content>
            <ion-card-subtitle>Scan</ion-card-subtitle>
            <ion-list>
              <ion-item v-for="(result, index) in scanResults" :key="index">
                {{ result.device.name || 'Unnamed device' }} ({{ result.device.deviceId }})
              </ion-item>
            </ion-list>
            <ion-button :disabled="isScanning" @click="scan">
              {{ isScanning ? 'Scanning' : isScanning ? 'Scanning...' : 'Scan' }}
            </ion-button>
          </ion-card-content>
          <ion-card-content>
            <ion-button :disabled="isConnecting" @click="connect">
              {{ isConnected ? 'Connected' : isConnecting ? 'Connecting…' : 'Connect' }}
            </ion-button>
            <ion-button color="medium" :disabled="!isConnected" @click="disconnect">
              Disconnect
            </ion-button>
            <ion-text color="danger" v-if="bleError">
              <p>{{ bleError }}</p>
            </ion-text>
          </ion-card-content>
        </ion-card>

        <ion-card>
          <ion-card-header>
            <ion-card-title>Credentials</ion-card-title>
            <ion-card-subtitle>Send over BLE to ESP32C</ion-card-subtitle>
          </ion-card-header>
          <ion-card-content>
            <ion-item>
              <ion-input v-model="ssid" label="Wi-Fi SSID" label-placement="stacked" />
            </ion-item>
            <ion-item>
              <ion-input v-model="pass" label="Wi-Fi Password" label-placement="stacked" type="password" />
            </ion-item>
            <ion-item>
              <ion-input v-model="azureHost" label="Azure Host" label-placement="stacked" />
            </ion-item>
            <ion-item>
              <ion-input v-model="azureDeviceId" label="Azure Device ID" label-placement="stacked" />
            </ion-item>
            <ion-item>
              <ion-input v-model="azureKeyB64" label="Device key" label-placement="stacked" />
            </ion-item>

            <ion-item lines="none">
              <ion-checkbox v-model="autoApply" justify="start">Apply after save</ion-checkbox>
            </ion-item>

            <ion-button expand="block" :disabled="!isConnected || isSending" @click="sendCredentials">
              {{ isSending ? 'Sending…' : 'Send Credentials' }}
            </ion-button>
          </ion-card-content>
        </ion-card>

        <ion-card>
          <ion-card-header>
            <ion-card-title>Status</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <ion-text>
              <pre class="status-log">{{ statusLog }}</pre>
            </ion-text>
          </ion-card-content>
        </ion-card>
      </ion-content>
    </ion-page>
  </ion-app>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import {
  IonApp,
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonButton,
  IonItem,
  IonInput,
  IonText,
  IonCheckbox,
} from '@ionic/vue';
import { BleClient, ScanResult, dataViewToText } from '@capacitor-community/bluetooth-le';

const SVC_UUID = '6E400001-B5A3-F393-E0A9-E50E24DCCA9E';
const CTRL_UUID = '6E400002-B5A3-F393-E0A9-E50E24DCCA9E';
const DATA_UUID = '6E400003-B5A3-F393-E0A9-E50E24DCCA9E';
const STATUS_UUID = '6E400004-B5A3-F393-E0A9-E50E24DCCA9E';

const ssid = ref('');
const pass = ref('');
const azureHost = ref('');
const azureDeviceId = ref('');
const azureKeyB64 = ref('');
const autoApply = ref(true);

const isConnecting = ref(false);
const isScanning = ref(false);
const isConnected = ref(false);
const isSending = ref(false);
const bleError = ref('');
const statusLog = ref('');
const scanResults = ref<ScanResult[]>([]);

let deviceId: string | null = null;
let bleInitialized = false;

const appendStatus = (line: string) => {
  statusLog.value = `${new Date().toLocaleTimeString()} ${line}\n${statusLog.value}`.trim();
};

const bytesToDataView = (bytes: Uint8Array) =>
  new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);

const ensureBleReady = async () => {
  if (!bleInitialized) {
    await BleClient.initialize({ androidNeverForLocation: true });
    bleInitialized = true;
    appendStatus('BLR initialized');
  }
};

const connect = async () => {
  bleError.value = '';
  isConnecting.value = true;
  try {
    const enabled = await BleClient.isEnabled();
    if (!enabled) {
      await BleClient.requestEnable();
    }

    const device = await BleClient.requestDevice({
      name: "Stemosoft smoke",
      services: [SVC_UUID],
    });

    // const device = await BleClient.requestDevice({
    //   name: '68:8C:81:AC:9A:9C',
    //   services: [SVC_UUID],
    // });


    deviceId = device.deviceId;

    await BleClient.connect(deviceId, () => {
      isConnected.value = false;
      appendStatus('disconnected');
    });

    await BleClient.startNotifications(deviceId, SVC_UUID, STATUS_UUID, (value) => {
      appendStatus(dataViewToText(value));
    });

    isConnected.value = true;
    appendStatus('connected');
  } catch (err) {
    bleError.value =
      (err as Error).message || 'Failed to connect. (Note: iOS simulator has no BLE)';
  } finally {
    isConnecting.value = false;
  }
};

const disconnect = async () => {
  if (deviceId) {
    await BleClient.stopNotifications(deviceId, SVC_UUID, STATUS_UUID).catch(() => undefined);
    await BleClient.disconnect(deviceId).catch(() => undefined);
  }
  isConnected.value = false;
  appendStatus('disconnected');
};

const writeCtrl = async (bytes: Uint8Array) => {
  if (!deviceId) throw new Error('No connected device');

  await BleClient.write(deviceId, SVC_UUID, CTRL_UUID, bytesToDataView(bytes));
};

const writeData = async (bytes: Uint8Array) => {
  if (!deviceId) throw new Error('No connected device');
  await BleClient.writeWithoutResponse(deviceId, SVC_UUID, DATA_UUID, bytesToDataView(bytes));
};

const buildStartPacket = (len: number) => {
  const buf = new ArrayBuffer(1 + 4);
  const view = new DataView(buf);
  view.setUint8(0, 0x01);
  view.setUint32(1, len, true);
  return new Uint8Array(buf);
};

const sendCredentials = async () => {
  bleError.value = '';
  if (!isConnected.value || !deviceId) return;

  // const payload = {
  //   deviceId: azureDeviceId.value,
  //   ssid: ssid.value,
  //   password: pass.value,
  //   host: azureHost.value,
  //   device_key: azureKeyB64.value,
  // };

  const payload = {
    deviceId: "58:8C:81:AC:9A:9C",
    ssid: "Sp_Deco_6",
    password: "48575443BDDB9EA3",
    host: "ArduinoMqtt.azure-devices.net",
    device_key: "OgsQTNvb40jHTORZCnl9AiC/GDpY6BDAC5xjQ9Voshc=",
  };

  const json = JSON.stringify(payload);
  const bytes = new TextEncoder().encode(json);

  isSending.value = true;
  try {
    //await writeCtrl(buildStartPacket(bytes.length));

    // const chunkSize = 180;
    // for (let i = 0; i < bytes.length; i += chunkSize) {
    //   const chunk = bytes.slice(i, i + chunkSize);
    //   await writeData(chunk);
    // }
    await BleClient.write(deviceId, SVC_UUID, DATA_UUID, bytesToDataView(bytes));

    //await writeCtrl(new Uint8Array([0x02]));

    //if (autoApply.value) {
    //  await writeCtrl(new Uint8Array([0x03]));
    //}

    appendStatus('sent credentials');
  } catch (err) {
    bleError.value = (err as Error).message || 'Failed to send credentials.';
  } finally {
    isSending.value = false;
  }
};

const scan = async () => {
  isScanning.value = true;
  scanResults.value = [];
  try {
    await BleClient.requestLEScan({}, (result: ScanResult) => {
      appendStatus(`A bluetooth device has been found ${result}`);
      scanResults.value.push(result);
    });

    setTimeout(() => {
      void BleClient.stopLEScan();
      isScanning.value = false;
    }, 10000);
    scanResults.value.sort((a, b) => (a.device.name || '').localeCompare(b.device.name || ''));
    return scanResults;
  } catch (error) {
    appendStatus('Bluetooth Scan Error: ' + error);
    isScanning.value = false;
    return scanResults;
  }
}

onMounted(async () => {
  await ensureBleReady();
});
</script>

<style scoped>
.status-log {
  white-space: pre-wrap;
  word-break: break-word;
  font-size: 12px;
  line-height: 1.3;
  margin: 0;
}
</style>
