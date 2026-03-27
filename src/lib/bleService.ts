/**
 * Web Bluetooth API Utilities for GoNepal PWA
 * Provides BLE device scanning and connection capabilities
 * for trekking sensors, heart rate monitors, and other BLE devices
 * 
 * Note: Requires HTTPS context for Web Bluetooth API to work
 */

export interface BLEDeviceInfo {
  device: BluetoothDevice;
  name: string;
  id: string;
  rssi?: number;
  isConnected: boolean;
}

export interface BLECharacteristic {
  uuid: string;
  serviceUUID: string;
  value?: DataView;
  properties: {
    read: boolean;
    write: boolean;
    writeWithoutResponse: boolean;
    notify: boolean;
  };
}

// Check if Web Bluetooth API is available
export const isBluetoothSupported = (): boolean => {
  return 'bluetooth' in navigator;
};

// Request a BLE device with optional filters
export const requestBLEDevice = async (
  filters?: BluetoothLEScanFilter[]
): Promise<BluetoothDevice | null> => {
  if (!isBluetoothSupported()) {
    console.warn('[BLE] Web Bluetooth API not supported in this browser');
    return null;
  }

  try {
    const device = await navigator.bluetooth.requestDevice({
      filters: filters || [],
      optionalServices: [
        'battery_service',
        'heart_rate',
        'health_thermometer',
        'blood_pressure',
        'weight_scale',
        'generic_access',
        'generic_attribute',
      ],
    });
    
    console.log('[BLE] Device selected:', device.name);
    return device;
  } catch (error) {
    console.error('[BLE] Error requesting device:', error);
    return null;
  }
};

// Connect to a BLE device
export const connectToDevice = async (
  device: BluetoothDevice
): Promise<BluetoothRemoteGATTServer | null> => {
  if (!device.gatt) {
    console.error('[BLE] Device has no GATT server');
    return null;
  }

  try {
    const server = await device.gatt.connect();
    console.log('[BLE] Connected to device:', device.name);
    return server;
  } catch (error) {
    console.error('[BLE] Error connecting to device:', error);
    return null;
  }
};

// Disconnect from a BLE device
export const disconnectFromDevice = (device: BluetoothDevice): void => {
  if (device.gatt?.connected) {
    device.gatt.disconnect();
    console.log('[BLE] Disconnected from device:', device.name);
  }
};

// Get all services from a connected device
export const getDeviceServices = async (
  server: BluetoothRemoteGATTServer
): Promise<BluetoothRemoteGATTService[]> => {
  try {
    const services = await server.getPrimaryServices();
    console.log('[BLE] Found services:', services.length);
    return services;
  } catch (error) {
    console.error('[BLE] Error getting services:', error);
    return [];
  }
};

// Get characteristics for a service
export const getServiceCharacteristics = async (
  service: BluetoothRemoteGATTService
): Promise<BluetoothRemoteGATTCharacteristic[]> => {
  try {
    const characteristics = await service.getCharacteristics();
    console.log('[BLE] Found characteristics:', characteristics.length);
    return characteristics;
  } catch (error) {
    console.error('[BLE] Error getting characteristics:', error);
    return [];
  }
};

// Read a characteristic value
export const readCharacteristic = async (
  characteristic: BluetoothRemoteGATTCharacteristic
): Promise<DataView | null> => {
  try {
    const value = await characteristic.readValue();
    console.log('[BLE] Read characteristic value');
    return value;
  } catch (error) {
    console.error('[BLE] Error reading characteristic:', error);
    return null;
  }
};

// Write to a characteristic
export const writeCharacteristic = async (
  characteristic: BluetoothRemoteGATTCharacteristic,
  value: BufferSource
): Promise<boolean> => {
  try {
    await characteristic.writeValue(value);
    console.log('[BLE] Written to characteristic');
    return true;
  } catch (error) {
    console.error('[BLE] Error writing to characteristic:', error);
    return false;
  }
};

// Subscribe to characteristic notifications
export const subscribeToCharacteristic = async (
  characteristic: BluetoothRemoteGATTCharacteristic,
  callback: (value: DataView) => void
): Promise<boolean> => {
  try {
    await characteristic.startNotifications();
    characteristic.addEventListener('characteristicvaluechanged', (event) => {
      const target = event.target as BluetoothRemoteGATTCharacteristic;
      if (target.value) {
        callback(target.value);
      }
    });
    console.log('[BLE] Subscribed to characteristic notifications');
    return true;
  } catch (error) {
    console.error('[BLE] Error subscribing to notifications:', error);
    return false;
  }
};

// Stop notifications for a characteristic
export const unsubscribeFromCharacteristic = async (
  characteristic: BluetoothRemoteGATTCharacteristic
): Promise<boolean> => {
  try {
    await characteristic.stopNotifications();
    console.log('[BLE] Unsubscribed from characteristic notifications');
    return true;
  } catch (error) {
    console.error('[BLE] Error stopping notifications:', error);
    return false;
  }
};

// Common BLE Service UUIDs
export const BLE_SERVICES = {
  BATTERY: 'battery_service',
  HEART_RATE: 'heart_rate',
  HEALTH_THERMOMETER: 'health_thermometer',
  BLOOD_PRESSURE: 'blood_pressure',
  WEIGHT_SCALE: 'weight_scale',
  GENERIC_ACCESS: 'generic_access',
  GENERIC_ATTRIBUTE: 'generic_attribute',
} as const;

// Common BLE Characteristic UUIDs
export const BLE_CHARACTERISTICS = {
  BATTERY_LEVEL: 'battery_level',
  HEART_RATE_MEASUREMENT: 'heart_rate_measurement',
  BODY_TEMPERATURE: 'body_temperature',
  BLOOD_PRESSURE_MEASUREMENT: 'blood_pressure_measurement',
  WEIGHT_MEASUREMENT: 'weight_measurement',
} as const;

// Scan for nearby BLE devices (requires device selection UI)
export const scanForDevices = async (): Promise<BluetoothDevice[]> => {
  if (!isBluetoothSupported()) {
    console.warn('[BLE] Web Bluetooth API not supported');
    return [];
  }

  try {
    const device = await navigator.bluetooth.requestDevice({
      filters: [], // Empty filters to show all devices
      optionalServices: Object.values(BLE_SERVICES),
    });
    
    return device ? [device] : [];
  } catch (error) {
    console.error('[BLE] Error scanning for devices:', error);
    return [];
  }
};

// Get battery level from device (if supported)
export const getBatteryLevel = async (
  device: BluetoothDevice
): Promise<number | null> => {
  if (!device.gatt?.connected) {
    console.warn('[BLE] Device not connected');
    return null;
  }

  try {
    const batteryService = await device.gatt.getPrimaryService(
      BLE_SERVICES.BATTERY
    );
    const batteryLevel = await batteryService.getCharacteristic(
      BLE_CHARACTERISTICS.BATTERY_LEVEL
    );
    const value = await batteryLevel.readValue();
    return value.getUint8(0);
  } catch (error) {
    console.error('[BLE] Error getting battery level:', error);
    return null;
  }
};