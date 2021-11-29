/**
 * 开启蓝牙适配器并扫描蓝牙设备
 */
const openAndDiscoverBLE = (callback) => {
  return new Promise((resolve, reject) => {
    wx.openBluetoothAdapter({
      success: res => {
        // 开启成功，开始扫描蓝牙设备
        console.log('蓝牙适配器已开启');
        discoverBLE()
        // 发现设备
        wx.onBluetoothDeviceFound((result) => {
          let device = result.devices[0] ?? {}
          callback(device)
        })
      },
      fail: error => {
          // 失败
          if (error.errCode !== 10001) reject(error) // 蓝牙设备不可用
          wx.onBluetoothAdapterStateChange((res) => {
            if (!res.available) reject(error)
            wx.startBluetoothDevicesDiscovery({
              allowDuplicatesKey: false,
            })
          })
          reject(error)
      }
    })
  })
}

/**
 * 开始扫描蓝牙设备
 */
const discoverBLE = () => {
  wx.startBluetoothDevicesDiscovery({
    allowDuplicatesKey: false,
    success: res => {
      console.log('开始扫描蓝牙设备');
    }
  })
}

/**
 * 停止扫描蓝牙设备
 */
const stopDiscoverBLE = () => {
  wx.getBluetoothAdapterState({
    success: (result) => {
      result.discovering && wx.stopBluetoothDevicesDiscovery({
        success: (res) => {
          console.log('已停止扫描蓝牙设备');
        },
      })
    },
  })
}

/**
 * 通过deviceId连接蓝牙设备并查询设备提供的服务
 * @param {string} deviceId 设备ID
 * @param {boolean} flag 是否停止扫描，默认为true
 */
const connectDevice = (deviceId, flag = true) => {
  return new Promise((resolve, reject) => {
    console.log('创建蓝牙连接：', deviceId);
    wx.createBLEConnection({
      deviceId: deviceId,
      success: res => {
        // 查询设备提供的服务
        console.log('蓝牙设备已连接', deviceId);
        servicesOfBLE(deviceId).then(resolve).catch(reject)
      },
      fail: error => {
        reject(error)
      }
    })
    flag && stopDiscoverBLE()
  })
}

/**
 * 通过设备ID查询服务
 * @param {string} deviceId 设备ID
 */
const servicesOfBLE = (deviceId) => {
  return new Promise((resolve, reject) => {
    wx.getBLEDeviceServices({
      deviceId: deviceId,
      success: res => {
        console.log('设备服务已查询', res);
        resolve(res)
      },
      fail: error => {
        reject(error)
      }
    })
  })
}

/**
 * 通过设备ID与服务ID获取设备的特征
 * @param {string} deviceId 设备ID
 * @param {string} serviceId 服务ID
 */
const characteristicsOfBLE = (deviceId, serviceId) => {
  return new Promise((resolve, reject) => {
    wx.getBLEDeviceCharacteristics({
      deviceId: deviceId,
      serviceId: serviceId,
      success: res => {
        console.log('服务特征已查询', res);
        resolve(res)
      },
      fail: error => {
        reject(error)
      }
    })
  })
}

/**
 * 如果该特征可订阅，通过设备ID、服务ID、特征ID订阅该特征的变化
 * @param {string} deviceId 设备ID
 * @param {string} serviceId 服务ID
 * @param {string} characteristicId 特征ID
 */
const onBLECharacteristicValueChange = (deviceId, serviceId, characteristicId, callback) => {
  wx.notifyBLECharacteristicValueChange({
    characteristicId: characteristicId,
    deviceId: deviceId,
    serviceId: serviceId,
    state: true,
    success: callback
  })
}

/**
 * 如果该特征可写，通过设备ID、服务ID、特征ID、写入的值修改该设备对应服务的特征值
 * @param {string} deviceId 设备ID
 * @param {string} serviceId 服务ID
 * @param {string} characteristicId 特征ID
 * @param {ArrayBuffer} buffer 写入的值：0x00的16进制数据 
 * 
 * 类似 let buffer = new ArrayBuffer(length); 
 * 
 * let dataView = new DataView(buffer); 
 * 
 * dataView.setUnit8(0, 0)
 */
const writeBLECharacteristicValue = (deviceId, serviceId, characteristicId, buffer) => {
  wx.writeBLECharacteristicValue({
    characteristicId: characteristicId,
    deviceId: deviceId,
    serviceId: serviceId,
    value: buffer,
  }).then(res => {
    console.log('写入成功：', res)
  }).catch(error => {
    console.log('写入失败：', error);
  })
}

/**
 * 取消特征的订阅
 */
const offCharacteristicValueChange = () => {
  wx.offBLECharacteristicValueChange()
}

/**
 * 通过设备ID关闭与该设备的连接
 * @param {string} deviceId 设备ID
 */
const closeBLEConnection = (deviceId) => {
  return new Promise((resolve, reject) => {
    wx.closeBLEConnection({
      deviceId: deviceId,
      success: res => {
        console.log('蓝牙链接已关闭', deviceId);
        resolve(res)
      },
      fail: error => {
        reject(error)
      }
    })
  })
}

/**
 * 关闭蓝牙适配器
 */
const closeBLE = () => {
  wx.closeBluetoothAdapter({
    success: (res) => {
      console.log('蓝牙适配器已关闭');
    },
  })
}

module.exports = {
    openAndDiscoverBLE,
    closeBLE,
    discoverBLE,
    stopDiscoverBLE,
    connectDevice,
    closeBLEConnection,
    servicesOfBLE,
    characteristicsOfBLE,
    onBLECharacteristicValueChange,
    writeBLECharacteristicValue,
    offCharacteristicValueChange
}