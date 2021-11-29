/**
 * 通过设备判断是否为同一房间，同一房间一分钟内只提示一次
 * 不同设备2s内只提醒一次
 */

import audioFile from '../audio/alarmVoice.wav'

// tag集合
const set = new Set()
// 任务队列
const tasks = []
// 播放开始时间
const play = {
  startTime: null
}

/**
 * 播放结束后删除播放队列第一个函数，并执行新的第一个函数
 */
function playTask() {
  let audio = new Audio(audioFile)
  audio.play()
  play.startTime = Date.parse(new Date())
  audio.addEventListener('ended', () => {
    tasks.shift()
    tasks.length && tasks[0]()
  })
}

/**
 * 
 * @param {object} alert 警告对象
 * @returns 警告对象的类型与设备码组成的标签
 */
function tagOf(alert) {
  return `${alert.imei}`
}

/**
 * 距离上一次播放是否超过2s
 * @returns 
 */
function exceed2second() {
  if (play.startTime) {
    let time = Date.parse(new Date())
    return time - play.startTime > 2000
  } else {
    return true
  }
}

/**
 * 超过一分钟或者是新警告
 * @param {object} alert 警告对象
 * @returns boolean
 */
function exceedAMinuteOrNew(alert) {
  return !set.has(tagOf(alert))
}

function addTag(alert) {
  set.add(tagOf(alert))
}

function deleteTag(alert) {
  set.delete(tagOf(alert))
}

/**
 * 是否播放提示音的判断条件
 * @param {object} alert 报警对象
 * @returns 
 */
function condition(alert) {
  return exceed2second() && exceedAMinuteOrNew(alert)
}

/**
 * 播放提示音，同一个警报一分钟内只播放一次 
 * @param {object} alert 警报对象
 */
export default async function alertTone(alert) {
  if (condition(alert)) {
    // 将播放任务加入任务队列，如果播放队列长度是1则执行该任务
    tasks.push(playTask)
    tasks.length === 1 && tasks[0]()
    addTag(alert)
    // 一分钟后删除tag
    setTimeout(() => {
      deleteTag(alert)
    }, 60 * 1000)
  }
}
